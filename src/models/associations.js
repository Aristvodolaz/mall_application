const Shop = require('./Shop');
const Review = require('./Review');
const User = require('./User');
const Promotion = require('./Promotion');

// Настройка ассоциаций
const setupAssociations = () => {
    console.log('Настройка ассоциаций между моделями...');

    // Ассоциации для магазинов
    Shop.hasMany(Review, {
        foreignKey: 'shop_id',
        as: 'reviews'
    });

    Shop.hasMany(Promotion, {
        foreignKey: 'shop_id',
        as: 'promotions'
    });

    // Ассоциации для отзывов
    Review.belongsTo(Shop, {
        foreignKey: 'shop_id',
        as: 'shop'
    });

    Review.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // Ассоциации для акций
    Promotion.belongsTo(Shop, {
        foreignKey: 'shop_id',
        as: 'shop'
    });

    console.log('Ассоциации успешно настроены');
};

module.exports = setupAssociations; 