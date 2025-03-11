'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID магазинов
    const shops = await queryInterface.sequelize.query(
      'SELECT id FROM shops;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (shops.length === 0) {
      console.log('Нет магазинов для создания акций');
      return;
    }

    const promotions = [];
    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Акция для первого магазина (ZARA)
    promotions.push({
      title: 'Скидки до 50% на весеннюю коллекцию',
      description: 'Только до конца месяца скидки на всю весеннюю коллекцию одежды и аксессуаров.',
      start_date: now,
      end_date: oneMonthLater,
      discount_type: 'percentage',
      discount_value: 50,
      shop_id: shops[0].id,
      image_url: '/images/promotions/zara-sale.jpg',
      created_at: now,
      updated_at: now
    });

    // Акция для второго магазина (Nike)
    if (shops.length > 1) {
      promotions.push({
        title: 'Скидка 30% на вторую пару обуви',
        description: 'При покупке любой пары обуви вторая пара со скидкой 30%.',
        start_date: now,
        end_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 недели
        discount_type: 'percentage',
        discount_value: 30,
        shop_id: shops[1].id,
        image_url: '/images/promotions/nike-sale.jpg',
        created_at: now,
        updated_at: now
      });
    }

    // Акция для третьего магазина (Starbucks)
    if (shops.length > 2) {
      promotions.push({
        title: 'Второй напиток в подарок',
        description: 'При покупке любого напитка второй такой же в подарок с 15:00 до 18:00.',
        start_date: now,
        end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 неделя
        discount_type: 'bogo',
        discount_value: 100,
        shop_id: shops[2].id,
        image_url: '/images/promotions/starbucks-sale.jpg',
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('promotions', promotions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('promotions', null, {});
  }
}; 