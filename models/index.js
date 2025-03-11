const User = require('./User');
const Shop = require('./Shop');
const Event = require('./Event');
const Ticket = require('./Ticket');
const Review = require('./Review');
const Promotion = require('./Promotion');

// Связи между магазином и отзывами
Shop.hasMany(Review, {
    foreignKey: 'shop_id',
    as: 'reviews'
});
Review.belongsTo(Shop, {
    foreignKey: 'shop_id'
});

// Связи между пользователем и отзывами
User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews'
});
Review.belongsTo(User, {
    foreignKey: 'user_id'
});

// Связи между магазином и акциями
Shop.hasMany(Promotion, {
    foreignKey: 'shop_id',
    as: 'promotions'
});
Promotion.belongsTo(Shop, {
    foreignKey: 'shop_id'
});

// Связи между событием и билетами
Event.hasMany(Ticket, {
    foreignKey: 'event_id',
    as: 'tickets'
});
Ticket.belongsTo(Event, {
    foreignKey: 'event_id'
});

// Связи между пользователем и билетами
User.hasMany(Ticket, {
    foreignKey: 'user_id',
    as: 'tickets'
});
Ticket.belongsTo(User, {
    foreignKey: 'user_id'
});

module.exports = {
    User,
    Shop,
    Event,
    Ticket,
    Review,
    Promotion
}; 