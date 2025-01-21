const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Убедитесь, что путь к модели корректен
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware для проверки токена
const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Укажите номер телефона и пароль' });
    }

    try {
        const userExists = await User.findOne({ where: { phone } });
        if (userExists) {
            return res.status(400).json({ message: 'Phone already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, phone, password: hashedPassword });

        const token = jwt.sign({ id: newUser.id, phone: newUser.phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered', token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, phone: user.phone, rating: user.rating || 5 } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Получение профиля пользователя
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'phone', 'rating', 'createdAt'],
        });

        if (!user) {
            return res.status(405).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
    const { username, phone } = req.body;

    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ where: { phone } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone already in use' });
            }
        }

        user.username = username || user.username;
        user.phone = phone || user.phone;
        await user.save();

        res.json({ message: 'Profile updated', user: { id: user.id, username: user.username, phone: user.phone } });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
