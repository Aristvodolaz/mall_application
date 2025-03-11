'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('events', [
      {
        title: 'Ночь распродаж',
        description: 'Грандиозная распродажа во всех магазинах ТРЦ. Скидки до 70%!',
        date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // через неделю
        time: '22:00',
        category: 'sale',
        image: '/images/events/sale.jpg',
        location: 'Весь ТРЦ',
        price: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Детский праздник',
        description: 'Развлекательная программа для детей: аниматоры, конкурсы, подарки',
        date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
        time: '12:00',
        category: 'kids',
        image: '/images/events/kids.jpg',
        location: 'Центральная площадь, 1 этаж',
        price: 500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Модный показ',
        description: 'Показ новых коллекций весна-лето 2024',
        date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // через 5 дней
        time: '19:00',
        category: 'fashion',
        image: '/images/events/fashion.jpg',
        location: 'Подиум, 2 этаж',
        price: 1000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Мастер-класс по кулинарии',
        description: 'Научитесь готовить изысканные блюда под руководством шеф-повара',
        date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // через 2 дня
        time: '15:00',
        category: 'master-class',
        image: '/images/events/cooking.jpg',
        location: 'Фуд-корт, 3 этаж',
        price: 1500,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('events', null, {});
  }
}; 