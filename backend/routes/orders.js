const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { Order, User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

// Add a new order
router.post('/', authenticateToken,upload.single('photo'), async (req, res) => {
    const { address, description, workTime, proposedSum, coordinates, type } = req.body;
    const userId = req.user.id;

    try {
        const geoData = await geocoder.geocode(address);
        if (!geoData.length) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { latitude, longitude } = geoData[0];
        const newOrder = await Order.create({
            userId,
            address,
            description,
            workTime,
            proposedSum,
            latitude,
            longitude,
            coordinates,
            type,
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all orders
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: ['id', 'address', 'description', 'workTime', 'proposedSum', 'coordinates', 'type'],
            where: {
                status: 'pending', // Фильтр по статусу "active"
            },
        });
        res.json(orders);
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Get active orders
router.get('/active-orders', authenticateToken , async (req, res) => {
    try {
        const userId = req.user.id; // ID текущего авторизованного пользователя
        const activeOrders = await Order.findAll({
            where: {
                status: 'active', // Фильтр по статусу "active"
                executorId: userId, // Только заказы, привязанные к текущему пользователю
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
        const order = await Order.findByPk(id, {
            include: { model: User, as: 'user', attributes: ['id', 'username', 'phone'] },
        });

        if (order && order.executorId === currentUserId) {
            return res.json({ ...order.toJSON(), phone: order.User.phone });
        } else {
            return res.status(403).json({ message: 'Доступ к номеру запрещен' });
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Take an order
router.post('/:id/take', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order is not available' });
        }

        order.status = 'active';
        order.executorId = userId;
        await order.save();

        res.json({ message: 'Order taken', order });
    } catch (error) {
        console.error('Error taking order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Завершение заказа
router.post('/:orderId/complete', async (req, res) => {
    const { orderId } = req.params;

    try {
        // Поиск заказа по ID
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        // Обновление статуса заказа
        order.status = 'completed';
        await order.save();

        res.status(200).json({ message: 'Заказ успешно завершен', order });
    } catch (error) {
        console.error('Ошибка при завершении заказа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


module.exports = router;
