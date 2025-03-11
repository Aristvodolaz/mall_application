'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const shops = [
      {
        name: 'Zara',
        description: 'Магазин модной одежды',
        category: 'Одежда',
        floor: 2,
        opening_hours: '10:00-22:00',
        phone: '+7 (999) 123-45-67',
        logo_url: '/images/shops/zara.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'М.Видео',
        description: 'Магазин электроники и бытовой техники',
        category: 'Электроника',
        floor: 1,
        opening_hours: '10:00-22:00',
        phone: '+7 (999) 234-56-78',
        logo_url: '/images/shops/mvideo.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Спортмастер',
        description: 'Спортивные товары и одежда',
        category: 'Спорт',
        floor: 3,
        opening_hours: '10:00-22:00',
        phone: '+7 (999) 345-67-89',
        logo_url: '/images/shops/sportmaster.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('shops', shops, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('shops', null, {});
  }
}; 