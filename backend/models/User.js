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
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    is: /^[0-9]{10,15}$/, // Допускаем номера от 10 до 15 цифр
                },
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
