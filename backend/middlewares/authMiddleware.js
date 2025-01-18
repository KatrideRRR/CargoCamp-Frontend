const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', req.headers.authorization); // Логируем заголовок

    const token = authHeader?.split(" ")[1];
    if (!token) {
        console.log('Токен отсутствует');
        return res.status(401).json({ message: "Токен отсутствует" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Расшифрованный токен:', decoded); // Логируем содержимое токена
        console.log('JWT_SECRET:', process.env.JWT_SECRET);


        const user = await User.findByPk(decoded.id);
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(401).json({ message: "Пользователь не найден" });
        }

        req.user = { userId: user.id }; // Добавляем пользователя в запрос
        next();
    } catch (error) {
        console.error("Ошибка авторизации:", error.message);
        res.status(401).json({ message: "Неверный токен" });
    }
};


module.exports = authMiddleware;

