'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Проверяем, существует ли колонка movie_id
    const table = await queryInterface.describeTable('movie_reviews');
    if (!table.movie_id) {
      await queryInterface.addColumn('movie_reviews', 'movie_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('movie_reviews', 'movie_id');
  }
}; 