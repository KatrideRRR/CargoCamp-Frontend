const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            // Связь с моделью Order
            User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
        }
    }
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
        },
        {
            sequelize,
            modelName: 'User',
        }
    );
    User.associate = (models) => {
        User.hasMany(models.Order, {
            foreignKey: 'userId',
            as: 'orders',
        });
    };

    return User;
};
