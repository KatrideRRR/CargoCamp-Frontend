const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,       // Имя базы данных
    process.env.DB_USER,       // Пользователь
    process.env.DB_PASSWORD,   // Пароль
    {
        host: process.env.DB_HOST,  // Хост (обычно 'localhost')
        dialect: process.env.DB_DIALECT, // 'mysql'
        logging: console.log,       // Включить логирование запросов

            development: {
                dialect: "sqlite",
                storage: "./database.sqlite",
                logging: console.log, // Логирование запросов
            },
    }


);



module.exports = sequelize;
