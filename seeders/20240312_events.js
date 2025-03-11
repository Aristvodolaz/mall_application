'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const events = [
      {
        title: 'Детский праздник',
        description: 'Большой детский праздник с аниматорами, конкурсами и подарками',
        date: new Date(new Date().setDate(new Date().getDate() + 7)),
        time: '12:00',
        location: 'Центральная площадь, 1 этаж',
        image_url: '/images/events/kids-party.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Модный показ',
        description: 'Показ новых коллекций магазинов ТРЦ',
        date: new Date(new Date().setDate(new Date().getDate() + 14)),
        time: '18:00',
        location: 'Подиум, 2 этаж',
        image_url: '/images/events/fashion-show.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Мастер-класс по кулинарии',
        description: 'Учимся готовить итальянские блюда с шеф-поваром',
        date: new Date(new Date().setDate(new Date().getDate() + 21)),
        time: '15:00',
        location: 'Фудкорт, 3 этаж',
        image_url: '/images/events/cooking-class.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('events', events, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('events', null, {});
  }
}; 