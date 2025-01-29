// routes/orders.js
const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { Order, User } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');
const multer = require('multer');
const { Op } = require('sequelize');
const upload = multer({ dest: 'uploads/' });

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });

// Add a new order
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
    const { address, description, workTime, proposedSum, coordinates, type } = req.body;
    const userId = req.user.id;

    try {
        if (!address) {
            return res.status(400).json({ message: 'Адрес обязателен' });
        }

        const geoData = await geocoder.geocode(address);
        if (!geoData.length) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const newOrder = await Order.create({
            userId,
            address,
            description,
            workTime,
            proposedSum,
            coordinates,
            type,
            creatorId: userId,
            status: 'pending',
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

// Take an order
router.post('/:id/take', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const executorId = req.user.id;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order is not available' });
        }

        order.executorId = executorId;
        order.status = 'active';
        await order.save();

        res.json({ message: 'Order taken', order });
    } catch (error) {
        console.error('Error taking order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Complete an order
router.post('/:orderId/complete', authenticateToken, async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        order.status = 'completed';
        await order.save();

        res.status(200).json({ message: 'Заказ успешно завершен', order });
    } catch (error) {
        console.error('Ошибка при завершении заказа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
