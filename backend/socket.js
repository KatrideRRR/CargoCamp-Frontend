const socketIo = require('socket.io');

let io;
let users = {}; // Храним пользователей, подключившихся к WebSocket

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🟢 Новое подключение: ${socket.id}`);

        socket.on('register', (userId) => {
            console.log(`✅ Пользователь ${userId} зарегистрирован в WebSocket`);
            socket.join(`user_${userId}`); // Теперь WebSocket знает, кто заказчик
        });

        socket.on('joinChat', ({ userId }) => {
            users[userId] = socket.id;
            console.log(`Пользователь ${userId} подключился: ${socket.id}`);
        });

        socket.on('sendMessage', (message) => {
            console.log('Новое сообщение:', message);

            if (users[message.receiverId]) {
                io.to(users[message.receiverId]).emit('receiveMessage', message);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔴 Отключение: ${socket.id}`);
            Object.keys(users).forEach(userId => {
                if (users[userId] === socket.id) {
                    delete users[userId];
                }
            });
        });
    });

    return io;
}

function sendNotification(userId, event, data) {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
}

module.exports = { initializeSocket, sendNotification };
