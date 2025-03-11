'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('screenings', 'format', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '2D'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('screenings', 'format');
  }
}; 