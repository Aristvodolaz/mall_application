'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('movies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      genre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      director: {
        type: Sequelize.STRING
      },
      cast: {
        type: Sequelize.TEXT
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      age_restriction: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      poster_url: {
        type: Sequelize.STRING
      },
      trailer_url: {
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('movies', ['title']);
    await queryInterface.addIndex('movies', ['genre']);
    await queryInterface.addIndex('movies', ['release_date']);
    await queryInterface.addIndex('movies', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('movies');
  }
}; 