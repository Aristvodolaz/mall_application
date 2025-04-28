'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'total_tickets', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100
    });

    await queryInterface.addColumn('events', 'available_tickets', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100
    });

    await queryInterface.addColumn('events', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    await queryInterface.addColumn('events', 'is_featured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('events', 'total_tickets');
    await queryInterface.removeColumn('events', 'available_tickets');
    await queryInterface.removeColumn('events', 'is_active');
    await queryInterface.removeColumn('events', 'is_featured');
  }
}; 