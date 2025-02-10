const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { Order, User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { Op } = require('sequelize');
const path = require('path');
const { Sequelize } = require('sequelize');  // Импортируем Sequelize
const moment = require('moment'); // Для работы с датами

// Устанавливаем интервал для проверки заказов (например, каждое утро в 6:00)
setInterval(async () => {
    try {
        // Получаем все заказы, которые не были взяты в работу и созданы более 24 часов назад
        const ordersToDelete = await Order.findAll({
            where: {
                status: 'pending',
                createdAt: {
                    [Sequelize.Op.lt]: moment().subtract(24, 'hours').toDate(), // Заказы старше 24 часов
                },
            },
        });

        // Удаляем все такие заказы
        for (const order of ordersToDelete) {
            await order.destroy();
            console.log(`Заказ ${order.id} удален автоматически.`);
        }
    } catch (error) {
        console.error("Ошибка при удалении старых заказов:", error);
    }
}, 60 * 60 * 1000); // Проверка раз в час (можно настроить под свои нужды)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/orders'); // Папка для загрузки изображений
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    },
});

const upload = multer({ storage });

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

module.exports = (io) => {

    // Add a new order
    router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {  // 'images' — это поле для загрузки
        const { address, description, workTime, proposedSum, type } = req.body;
        const userId = req.user.id;

        try {
            if (!address) {
                return res.status(400).json({ message: 'Адрес обязателен' });
            }

            // Получаем координаты из геокодера
            const geoData = await geocoder.geocode(address);
            if (!geoData.length) {
                return res.status(404).json({ message: 'Адрес не найден' });
            }

            const { latitude, longitude } = geoData[0];
            const coordinates = `${latitude},${longitude}`;

            // Собираем все фото в массив
            const photoUrls = req.files ? req.files.map(file => `/uploads/orders/${file.filename}`) : [];

            const newOrder = await Order.create({
                userId,
                address,
                description,
                workTime,
                proposedSum,
                coordinates,
                type,
                createdAt: new Date().toISOString(),
                images: photoUrls,  // Сохраняем массив ссылок на фото
                creatorId: userId,
                status: 'pending',
            });

            io.emit('orderUpdated'); // Отправляем событие обновления заказов

            res.status(201).json(newOrder);
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    // Получить все заказы
    router.get('/all', async (req, res) => {
        try {
            // Удаляем старые заказы, не взятые в работу (старше 24 часов)
            const ordersToDelete = await Order.findAll({
                where: {
                    status: 'pending',
                    createdAt: {
                        [Sequelize.Op.lt]: moment().subtract(24, 'hours').toDate(), // Заказы старше 24 часов
                    },
                },
            });

            // Удаляем старые заказы
            for (const order of ordersToDelete) {
                await order.destroy();
                console.log(`Заказ ${order.id} удален автоматически.`);
            }

            // Получаем все оставшиеся заказы с статусом "pending"
            const orders = await Order.findAll({
                attributes: ['id', 'createdAt', 'address', 'description', 'workTime', 'images', 'proposedSum', 'creatorId', 'coordinates', 'type', 'executorId', 'status'],
                where: { status: 'pending' },
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    // Get active orders
    router.get('/active-orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const activeOrders = await Order.findAll({
            where: {
                status: 'active',
                [Op.or]: [{ creatorId: userId }, { executorId: userId }],
            },
        });
        res.json(activeOrders);
    } catch (error) {
        console.error('Ошибка при получении активных заказов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

    // Get order by ID
    router.get('/:id', async (req, res) => {
        const { id } = req.params;

        try {
            // Ищем заказ по ID, включая данные о пользователе
            const order = await Order.findByPk(id, {
                include: { model: User, as: 'user', attributes: ['id', 'username', 'phone'] },
            });

            // Если заказ не найден
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Убираем проверку на авторизацию, чтобы любой пользователь мог получить доступ
            // Проверка на доступность для создателя и исполнителя исключена

            // Если текущий пользователь - исполнитель, добавляем информацию о телефоне

            res.json(order);
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get request for order
    router.post('/:id/request', authenticateToken, async (req, res) => {
        const { id } = req.params;
        const executorId = req.user.id;

        try {
            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (order.status !== 'pending') {
                return res.status(400).json({ message: 'Заказ недоступен' });
            }

            if (order.executorId) {
                return res.status(400).json({ message: 'Исполнитель уже назначен' });
            }

            // Назначаем исполнителя, но не переводим в active
            order.executorId = executorId;
            await order.save();

            io.emit('orderRequested',
                { orderId: order.id, creatorId: order.creatorId, executorId: order.executorId });

            res.json({ message: 'Запрос на выполнение отправлен заказчику', order });
        } catch (error) {
            console.error('Ошибка при запросе заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    // Get approve for order
    router.post('/:id/approve', authenticateToken, async (req, res) => {
        const { id } = req.params;

        try {
            console.log(`⚡ Одобрение заказа ID: ${id} пользователем ID: ${req.user.id}`);

            const order = await Order.findByPk(id);

            if (!order) {
                console.log('❌ Заказ не найден');
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (order.creatorId !== req.user.id) {
                console.log('❌ Попытка одобрения чужого заказа');
                return res.status(403).json({ message: 'Вы не можете одобрить этот заказ' });
            }

            if (!order.executorId) {
                console.log('❌ Нет исполнителя');
                return res.status(400).json({ message: 'Нет исполнителя, ожидающего одобрения' });
            }

            // Изменение статуса заказа
            order.status = 'active';
            await order.save();
            console.log(`✅ Заказ ${order.id} одобрен!`);

            // Обновление списка заказов
            io.emit('orderUpdated');

            // Уведомляем исполнителя
            io.to(`user_${order.executorId}`).emit('orderApproved', {
                orderId: order.id,
                message: 'Ваш запрос на выполнение заказа одобрен!',
            });

            // Уведомляем заказчика
            io.to(`user_${order.creatorId}`).emit('orderApproved', {
                orderId: order.id,
                message: 'Вы успешно одобрили заказ!',
            });

            res.json({ message: 'Заказ одобрен!', order });
        } catch (error) {
            console.error('❌ Ошибка при одобрении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    //Get reject for order
    router.post('/:id/reject', authenticateToken, async (req, res) => {
        const { id } = req.params;

        try {
            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (order.creatorId !== req.user.id) {
                return res.status(403).json({ message: 'Вы не можете отклонить этот заказ' });
            }

            if (!order.executorId) {
                return res.status(400).json({ message: 'Нет исполнителя для отклонения' });
            }

            // Убираем исполнителя и оставляем заказ доступным
            order.executorId = null;
            await order.save();

            io.emit('orderUpdated');

            res.json({ message: 'Исполнитель отклонён', order });
        } catch (error) {
            console.error('Ошибка при отклонении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    // Complete an order
    router.post("/complete/:id", authenticateToken, async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.user.id; // ID текущего пользователя

            const order = await Order.findByPk(orderId);
            if (!order) return res.status(404).json({ message: "Заказ не найден" });

            // Проверяем, есть ли текущий пользователь среди тех, кто подтверждал завершение
            if (order.completedBy.includes(userId)) {
                return res.status(400).json({ message: "Вы уже подтвердили завершение" });
            }

            // Добавляем пользователя в массив `completedBy`
            order.completedBy = [...order.completedBy, userId];

            // Проверьте, если заказчик подтвердил завершение
            if (order.completedBy.includes(order.creatorId) && !order.completedBy.includes(order.executorId)) {
                // Уведомление исполнителю
                io.to(`user_${order.executorId}`).emit('orderCompleted', {
                    orderId: order.id,
                    message: 'Заказчик предложил завершить заказ',
                });
            }

            // Проверьте, если исполнитель подтвердил завершение
            if (order.completedBy.includes(order.executorId) && !order.completedBy.includes(order.creatorId)) {
                // Уведомление заказчику
                io.to(`user_${order.creatorId}`).emit('orderCompleted', {
                    orderId: order.id,
                    message: 'Исполнитель предложил завершить заказ',
                    creatorId: order.creatorId,   // ✅ Добавлено
                    executorId: order.executorId  // ✅ Добавлено
                });
            }


            // Если оба участника подтвердили, устанавливаем статус "completed"
            if (order.completedBy.includes(order.creatorId) && order.completedBy.includes(order.executorId)) {
                order.status = "completed";
            }
            order.completedAt = new Date(); // Фиксируем дату завершения
            await order.save();

            io.emit('orderUpdated'); // Обновление списка заказов
            io.emit('activeOrdersUpdated'); // Обновляем список активных заказов

            res.json(order);
        } catch (error) {
            console.error("Ошибка завершения заказа:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    });

    // Эндпоинт для отправки жалобы
    router.post('/complain', authenticateToken, async (req, res) => {
        const { orderId, complaintText } = req.body;
        const userId = req.user?.id;

        console.log('req.user:', req.user);
        console.log('userId:', userId);

        if (!userId) {
            return res.status(400).json({ message: 'Невозможно извлечь userId из токена' });
        }

        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            console.log('order:', order);
            console.log('customerId:', order.creatorId, 'executorId:', order.executorId, 'userId:', userId);

            let complainedUserId = null;
            if (userId === order.creatorId) {
                if (!order.executorId) {
                    return res.status(400).json({ message: 'У заказа пока нет исполнителя' });
                }
                complainedUserId = order.executorId;
            } else if (userId === order.executorId) {
                complainedUserId = order.creatorId;
            } else {
                console.log(`❌ Ошибка: Пользователь ${userId} не является участником заказа`);
                return res.status(403).json({ message: 'Вы не являетесь участником этого заказа' });
            }

            console.log(`Жалоба отправляется на userId: ${complainedUserId}`);

            const complainedUser = await User.findByPk(complainedUserId);
            const currentComplaints = complainedUser.complaints || [];
            const updatedComplaints = [...currentComplaints, { userId, complaintText, date: new Date() }];

            await User.update({
                complaintsCount: (complainedUser.complaintsCount || 0) + 1,
                complaints: updatedComplaints
            }, { where: { id: complainedUserId } });

            return res.status(200).json({ message: 'Жалоба отправлена успешно' });

        } catch (error) {
            console.error('Ошибка при отправке жалобы:', error);
            return res.status(500).json({ message: 'Ошибка при отправке жалобы' });
        }
    });

    // Завершенные заказы пользователя
    router.get('/completed/:userId', async (req, res) => {
        const { userId } = req.params;

        console.log("userId из запроса:", userId); // Проверяем, приходит ли userId

        if (!userId) {
            return res.status(400).json({ message: 'Некорректный userId' });
        }

        try {
            const completedOrders = await Order.findAll({
                where: {
                    status: 'completed',
                    [Op.or]: [
                        { creatorId: userId },  // Заказчик
                        { executorId: userId }   // Исполнитель
                    ]
                },
                attributes: ['id','type','address','proposedSum', 'status', 'completedAt', 'creatorId', 'executorId', 'description'], // Указываем, какие поля хотим вернуть
            });

            // Отправляем заказ с актуальной датой завершения
            res.json(completedOrders);
        } catch (error) {
            console.error('Ошибка при получении завершенных заказов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    // Созданные пользователем заказы
    router.get('/creator/:userId', async (req, res) => {
        const { userId } = req.params;

        try {
            const orders = await Order.findAll({
                where: {
                    creatorId: userId,
                    status: 'pending',
                },  // Фильтруем заказы по ID создателя
                include: { model: User, as: 'user', attributes: ['id', 'username'] },
            });

            if (!orders.length) {
                return res.status(404).json({ message: 'Заказы не найдены' });
            }

            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });

    return router;
};