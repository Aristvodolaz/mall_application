'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const events = [
      {
        title: 'Детский праздник',
        description: 'Большой детский праздник с аниматорами, конкурсами и подарками. В программе: шоу мыльных пузырей, аквагрим, мастер-классы и много сюрпризов!',
        date: new Date(new Date().setDate(new Date().getDate() + 7)),
        time: '12:00',
        location: 'Центральная площадь, 1 этаж',
        category: 'kids',
        image: 'https://example.com/images/events/kids-party.jpg',
        price: 500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Модный показ',
        description: 'Показ новых коллекций магазинов ТРЦ. Презентация весенне-летних коллекций 2024 года от ведущих брендов.',
        date: new Date(new Date().setDate(new Date().getDate() + 14)),
        time: '18:00',
        location: 'Подиум, 2 этаж',
        category: 'fashion',
        image: 'https://example.com/images/events/fashion-show.jpg',
        price: 1000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Мастер-класс по кулинарии',
        description: 'Учимся готовить итальянские блюда с шеф-поваром. В программе: паста карбонара, тирамису и секреты итальянской кухни.',
        date: new Date(new Date().setDate(new Date().getDate() + 21)),
        time: '15:00',
        location: 'Фудкорт, 3 этаж',
        category: 'cooking',
        image: 'https://example.com/images/events/cooking-class.jpg',
        price: 2000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Ночь распродаж',
        description: 'Грандиозная распродажа во всех магазинах ТРЦ. Скидки до 70%! Специальные предложения только в эту ночь.',
        date: new Date(new Date().setDate(new Date().getDate() + 30)),
        time: '22:00',
        location: 'Весь ТРЦ',
        category: 'sale',
        image: 'https://example.com/images/events/night-sale.jpg',
        price: 0,
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
