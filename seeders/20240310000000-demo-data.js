'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Создание пользователей
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Мария Петрова',
        email: 'maria@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Создание магазинов
    const shops = await queryInterface.bulkInsert('shops', [
      {
        name: 'ZARA',
        description: 'Модная одежда и аксессуары',
        category: 'fashion',
        floor: 2,
        opening_hours: '10:00-22:00',
        phone: '+7 (495) 123-45-67',
        image_url: '/images/shops/zara.jpg',
        logo_url: '/images/logos/zara.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Nike',
        description: 'Спортивная одежда и обувь',
        category: 'sport',
        floor: 1,
        opening_hours: '10:00-22:00',
        phone: '+7 (495) 234-56-78',
        image_url: '/images/shops/nike.jpg',
        logo_url: '/images/logos/nike.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Starbucks',
        description: 'Кофейня',
        category: 'food',
        floor: 3,
        opening_hours: '08:00-23:00',
        phone: '+7 (495) 345-67-89',
        image_url: '/images/shops/starbucks.jpg',
        logo_url: '/images/logos/starbucks.png',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Создание событий
    const events = await queryInterface.bulkInsert('events', [
      {
        title: 'Ночь распродаж',
        description: 'Грандиозная распродажа во всех магазинах ТРЦ. Скидки до 70%!',
        date: new Date('2024-04-15'),
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
        date: new Date('2024-04-20'),
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
        date: new Date('2024-04-25'),
        time: '19:00',
        category: 'fashion',
        image: '/images/events/fashion.jpg',
        location: 'Подиум, 2 этаж',
        price: 1000,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Создание акций
    await queryInterface.bulkInsert('promotions', [
      {
        shop_id: 1,
        title: 'Скидка 30% на новую коллекцию',
        description: 'Только до конца месяца скидка 30% на всю новую коллекцию',
        start_date: new Date('2024-04-01'),
        end_date: new Date('2024-04-30'),
        discount_type: 'percentage',
        discount_value: 30,
        image_url: '/images/promotions/zara-sale.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        shop_id: 2,
        title: 'Купи одну пару - вторая в подарок',
        description: 'При покупке одной пары кроссовок вторая пара в подарок',
        start_date: new Date('2024-04-01'),
        end_date: new Date('2024-04-15'),
        discount_type: 'bogo',
        discount_value: 100,
        image_url: '/images/promotions/nike-sale.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Создание отзывов
    await queryInterface.bulkInsert('reviews', [
      {
        user_id: 1,
        shop_id: 1,
        rating: 5,
        comment: 'Отличный магазин, большой выбор одежды!',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        shop_id: 2,
        rating: 4,
        comment: 'Хороший выбор кроссовок, но цены высоковаты',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Создание билетов
    await queryInterface.bulkInsert('tickets', [
      {
        user_id: 1,
        event_id: 2,
        quantity: 2,
        total_price: 1000,
        status: 'paid',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        event_id: 3,
        quantity: 1,
        total_price: 1000,
        status: 'paid',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Удаление данных в обратном порядке
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('promotions', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('shops', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
}; 