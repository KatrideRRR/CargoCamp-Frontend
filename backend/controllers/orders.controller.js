const { Order, User } = require('../models'); // Подключаем модели

async function getAllOrders(req, res) {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',  // Создатель заказа
                    attributes: ['id', 'username', 'phone'] // Только нужные данные
                },
                {
                    model: User,
                    as: 'executor', // Исполнитель заказа
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}
