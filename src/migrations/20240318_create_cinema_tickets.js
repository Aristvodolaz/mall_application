'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cinema_tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      screening_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'screenings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seat_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      row_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('reserved', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'reserved'
      },
      qr_code: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Добавляем индексы
    await queryInterface.addIndex('cinema_tickets', ['screening_id']);
    await queryInterface.addIndex('cinema_tickets', ['user_id']);
    await queryInterface.addIndex('cinema_tickets', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cinema_tickets');
  }
}; 