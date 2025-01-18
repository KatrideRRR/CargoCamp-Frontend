// createTables.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config(); // Для загрузки переменных из .env

// Подключение к базе данных
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: console.log, // Логировать запросы
    }
);

// Определение модели User
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 5.0,
    },
}, {
    timestamps: true,
});

// Создание таблицы
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с базой данных установлено.');

        await sequelize.sync({ force: true }); // Удаляет и создает заново
        console.log('Таблицы синхронизированы.');
    } catch (err) {
        console.error('Ошибка синхронизации таблиц:', err);
    } finally {
        await sequelize.close();
    }
})();
