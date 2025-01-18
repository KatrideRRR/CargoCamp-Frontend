module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'executorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // Имя таблицы пользователей
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Orders', 'executorId');
  },
};
