const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Убедитесь, что путь к модели корректен
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware для проверки токена
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Настройка хранения файлов (загружаем в папку uploads/)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/upload-document');
    },
    filename: (req, file, cb) => {
        const userId = req.user.id; // Получаем ID пользователя из токена или сессии
        const ext = path.extname(file.originalname); // Получаем расширение файла (например, .jpg)

        // Имя файла будет таким: id_пользователя_номер_изображения.расширение
        // Для этого нужно будет сначала получить количество загруженных файлов для пользователя
        User.findByPk(userId)
            .then(user => {
                const imageCount = user.documentPhotos ? user.documentPhotos.length : 0;
                const newFileName = `${userId}_${imageCount + 1}${ext}`; // Формируем новое имя
                cb(null, newFileName); // Отправляем новое имя файла
            })
            .catch(error => {
                cb(error);
            });
    }
});

const upload = multer({ storage });

// Маршрут для загрузки изображения
router.post('/upload-documents',authenticateToken, upload.array('documents', 5), async (req, res) => {
    try {
        const userId = req.user.id; // Получаем ID пользователя из токена или сессии

        const fileNames = req.files.map(file => file.filename); // Получаем имена загруженных файлов

        // Обновляем пользователя с новыми файлами
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Добавляем новые изображения в массив
        const updatedPhotos = user.documentPhotos ? [...user.documentPhotos, ...fileNames] : fileNames;

        user.documentPhotos = updatedPhotos; // Обновляем поле с изображениями
        await user.save(); // Сохраняем изменения в базе данных

        res.status(200).json({ message: 'Документы загружены успешно', files: updatedPhotos });
    } catch (error) {
        console.error('Ошибка при загрузке документов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

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
            attributes: ['id', 'username', 'phone', 'rating', 'createdAt','complaints','complaintsCount'],
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

router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId); // Sequelize пример
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'rating', 'complaintsCount', 'complaints']
        });
        if (!user) return res.status(404).json({ message: "Пользователь не найден" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/rate", authenticateToken,async (req, res) => {
    try {
        console.log('Получен запрос на рейтинг');

        const { userId, rating } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        user.rating = (user.rating * user.ratingCount + rating) / (user.ratingCount + 1);
        user.ratingCount += 1;

        await user.save();

        res.json({ message: "Рейтинг успешно обновлен" });
    } catch (error) {
        console.error("Ошибка обновления рейтинга", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
