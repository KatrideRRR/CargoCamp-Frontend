const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Order extends Model {
        static associate(models) {
            // Связь с моделью User
            Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    Order.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            workTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            proposedSum: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            photoUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            status: {
                type: DataTypes.ENUM('pending', 'active', 'completed'),
                defaultValue: 'pending', // По умолчанию новый заказ активен
            },
            executorId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

        },
        {
            sequelize,
            tableName: 'orders',
            modelName: 'Order',
            updatedAt: false, // Отключает только updatedAt
        }
    );

    return Order;
};
