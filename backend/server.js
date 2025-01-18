require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const initUser = require('./models/User');
const initOrder = require('./models/Order');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(bodyParser.json());
app.use('/api/orders', orderRoutes);
app.use(express.json());
app.use('/api/auth', authRoutes);


// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection error:', err));

sequelize.sync()
    .then(() => console.log('Database synchronized'))
    .catch(err => console.error('Error synchronizing database:', err));

// Models
const User = initUser(sequelize, Sequelize.DataTypes);
const Order = initOrder(sequelize, Sequelize.DataTypes);

User.associate({ Order });
Order.associate({ User });

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
