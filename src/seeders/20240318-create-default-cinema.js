'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('cinemas', [{
      name: 'Кинотеатр "Проспект"',
      description: 'Современный кинотеатр с комфортными залами и новейшим оборудованием',
      address: 'ул. Ленина, 218',
      city: 'dyatkovo',
      phone: '+7 (48333) 3-21-55',
      website_url: 'https://проспект-кино.рф',
      facility_id: 'prospekt-dyatkovo',
      total_halls: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cinemas', { facility_id: 'prospekt-dyatkovo' }, {});
  }
}; 