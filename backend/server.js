require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Sequelize = require('sequelize');

const initUser = require('./models/User');
const initOrder = require('./models/Order');
const initMessage = require('./models/Message');

const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let users = {}; // Храним пользователей, которые подключились к WebSocket

io.on('connection', (socket) => {
    console.log(`🟢 Новое подключение: ${socket.id}`);

    socket.on('register', (userId) => {
        console.log(`✅ Пользователь ${userId} зарегистрирован в WebSocket`);
        socket.join(`user_${userId}`); // Теперь WebSocket знает, кто заказчик
    });

    // Событие при заходе пользователя (например, присоединение к чату)
    socket.on('joinChat', ({ userId }) => {
        users[userId] = socket.id;
        console.log(`Пользователь ${userId} подключился: ${socket.id}`);
    });

    // Событие получения нового сообщения
    socket.on('sendMessage', (message) => {
        console.log('Новое сообщение:', message);

        // Отправляем сообщение всем, кроме отправителя
        if (users[message.receiverId]) {
            io.to(users[message.receiverId]).emit('receiveMessage', message);
        }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        console.log(`🔴 Отключение: ${socket.id}`);
        Object.keys(users).forEach(userId => {
            if (users[userId] === socket.id) {
                delete users[userId];
            }
        });
    });
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(bodyParser.json());
app.use('/api/orders', orderRoutes(io)); // Передаём io в маршруты
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/uploads', express.static('uploads'));

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('Database connected.'))
    .catch((err) => console.error('Database connection error:', err));

sequelize.sync()
    .then(() => console.log('Database synchronized.'))
    .catch(err => console.error('Error synchronizing database:', err));

// Models
const User = initUser(sequelize, Sequelize.DataTypes);
const Order = initOrder(sequelize, Sequelize.DataTypes);
const Message = initMessage(sequelize, Sequelize.DataTypes);

User.associate({ Order, Message });
Order.associate({ User });
Message.associate({ User });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));