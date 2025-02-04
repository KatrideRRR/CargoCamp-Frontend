const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { Order, User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { Op } = require('sequelize');
const path = require('path');

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
    router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
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

            // Берем координаты из первого результата геокодинга
            const { latitude, longitude } = geoData[0];
            const coordinates = `${latitude},${longitude}`;

            const photoUrl = req.file ? `/uploads/orders/${req.file.filename}` : null;

            const newOrder = await Order.create({
                userId,
                address,
                description,
                workTime,
                proposedSum,
                coordinates, // Теперь координаты корректные!
                type,
                photoUrl,
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

    // Get all orders
    router.get('/all', async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: ['id', 'address', 'description', 'workTime','photoUrl' ,'proposedSum','creatorId' ,'coordinates', 'type', 'executorId', 'status'],
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
    router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;

    try {
        const order = await Order.findByPk(id, {
            include: { model: User, as: 'user', attributes: ['id', 'username', 'phone'] },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.creatorId !== currentUserId && order.executorId !== currentUserId) {
            return res.status(403).json({ message: 'Нет доступа к заказу' });
        }

        const orderData = order.executorId === currentUserId
            ? { ...order.toJSON(), phone: order.user.phone }
            : order;

        res.json(orderData);
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

    //Get approve for order
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

            order.status = 'active';
            await order.save();
            console.log(`✅ Заказ ${order.id} одобрен!`);


            io.emit('orderUpdated'); // Обновление списка заказов
            // Уведомляем исполнителя
            io.to(`user_${order.executorId}`).emit('orderApproved', {
                orderId: order.id,
                message: 'Ваш запрос на выполнение заказа одобрен!',
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

            // Если оба участника подтвердили, устанавливаем статус "completed"
            if (order.completedBy.includes(order.creatorId) && order.completedBy.includes(order.executorId)) {
                order.status = "completed";
                order.completedAt = new Date(); // Фиксируем дату завершения
            }

            await order.save();

            io.emit('orderUpdated'); // Обновление списка заказов
            io.emit('activeOrdersUpdated'); // Обновляем список активных заказов

            res.json(order);
        } catch (error) {
            console.error("Ошибка завершения заказа:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    });

    return router;
};