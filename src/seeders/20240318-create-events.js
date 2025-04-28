'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const events = [
      {
        title: 'Детский праздник',
        description: 'Большой детский праздник с аниматорами, конкурсами и подарками. В программе: шоу мыльных пузырей, аквагрим, мастер-классы и много сюрпризов!',
        date: new Date(new Date().setDate(new Date().getDate() + 7)),
        time: '12:00:00',
        location: 'Центральная площадь, 1 этаж',
        category: 'kids',
        image_url: 'https://example.com/images/events/kids-party.jpg',
        total_tickets: 100,
        available_tickets: 100,
        price: 500,
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Модный показ',
        description: 'Показ новых коллекций магазинов ТРЦ. Презентация весенне-летних коллекций 2024 года от ведущих брендов.',
        date: new Date(new Date().setDate(new Date().getDate() + 14)),
        time: '18:00:00',
        location: 'Подиум, 2 этаж',
        category: 'fashion',
        image_url: 'https://example.com/images/events/fashion-show.jpg',
        total_tickets: 200,
        available_tickets: 200,
        price: 1000,
        is_active: true,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Мастер-класс по кулинарии',
        description: 'Учимся готовить итальянские блюда с шеф-поваром. В программе: паста карбонара, тирамису и секреты итальянской кухни.',
        date: new Date(new Date().setDate(new Date().getDate() + 21)),
        time: '15:00:00',
        location: 'Фудкорт, 3 этаж',
        category: 'cooking',
        image_url: 'https://example.com/images/events/cooking-class.jpg',
        total_tickets: 50,
        available_tickets: 50,
        price: 2000,
        is_active: true,
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Ночь распродаж',
        description: 'Грандиозная распродажа во всех магазинах ТРЦ. Скидки до 70%! Специальные предложения только в эту ночь.',
        date: new Date(new Date().setDate(new Date().getDate() + 30)),
        time: '22:00:00',
        location: 'Весь ТРЦ',
        category: 'sale',
        image_url: 'https://example.com/images/events/night-sale.jpg',
        total_tickets: 1000,
        available_tickets: 1000,
        price: 0,
        is_active: true,
        is_featured: true,
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