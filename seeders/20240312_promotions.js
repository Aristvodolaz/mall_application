'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const promotions = [
      {
        title: 'Скидка 50% на всю летнюю коллекцию',
        description: 'Грандиозная распродажа летней коллекции в Zara. Скидки до 50% на все товары.',
        shop_id: 1,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        discount_percent: 50,
        image_url: '/images/promotions/summer-sale.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Рассрочка 0% на 24 месяца',
        description: 'Купите любую технику в М.Видео в рассрочку на 24 месяца без переплат',
        shop_id: 2,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        discount_percent: null,
        image_url: '/images/promotions/mvideo-credit.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: '2=3 на все кроссовки',
        description: 'Купите две пары кроссовок и получите третью в подарок в Спортмастере',
        shop_id: 3,
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        discount_percent: 33,
        image_url: '/images/promotions/sportmaster-shoes.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('promotions', promotions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('promotions', null, {});
  }
}; 