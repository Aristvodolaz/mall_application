const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

// Импорт моделей
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Shop = require('./Shop')(sequelize, Sequelize.DataTypes);
const Event = require('./Event')(sequelize, Sequelize.DataTypes);
const Promotion = require('./Promotion')(sequelize, Sequelize.DataTypes);
const Review = require('./Review')(sequelize, Sequelize.DataTypes);
const Ticket = require('./Ticket')(sequelize, Sequelize.DataTypes);
const Movie = require('./Movie')(sequelize, Sequelize.DataTypes);
const Screening = require('./Screening')(sequelize, Sequelize.DataTypes);
const CinemaTicket = require('./CinemaTicket')(sequelize, Sequelize.DataTypes);
const MovieReview = require('./MovieReview')(sequelize, Sequelize.DataTypes);

// Определение связей
Shop.hasMany(Review, { foreignKey: 'shop_id' });
Review.belongsTo(Shop, { foreignKey: 'shop_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Shop.hasMany(Promotion, { foreignKey: 'shop_id' });
Promotion.belongsTo(Shop, { foreignKey: 'shop_id' });

Event.hasMany(Ticket, { foreignKey: 'event_id' });
Ticket.belongsTo(Event, { foreignKey: 'event_id' });

User.hasMany(Ticket, { foreignKey: 'user_id' });
Ticket.belongsTo(User, { foreignKey: 'user_id' });

// Связи для кинотеатра
Movie.hasMany(Screening, { foreignKey: 'movie_id' });
Screening.belongsTo(Movie, { foreignKey: 'movie_id' });

Screening.hasMany(CinemaTicket, { foreignKey: 'screening_id' });
CinemaTicket.belongsTo(Screening, { foreignKey: 'screening_id' });

User.hasMany(CinemaTicket, { foreignKey: 'user_id' });
CinemaTicket.belongsTo(User, { foreignKey: 'user_id' });

Movie.hasMany(MovieReview, { foreignKey: 'movie_id' });
MovieReview.belongsTo(Movie, { foreignKey: 'movie_id' });

User.hasMany(MovieReview, { foreignKey: 'user_id' });
MovieReview.belongsTo(User, { foreignKey: 'user_id' });

// Синхронизация моделей с базой данных
sequelize.sync()
    .then(() => {
        console.log('База данных синхронизирована');
    })
    .catch(err => {
        console.error('Ошибка синхронизации базы данных:', err);
    });

// Экспорт моделей и подключения
module.exports = {
    sequelize,
    Sequelize,
    User,
    Shop,
    Event,
    Promotion,
    Review,
    Ticket,
    Movie,
    Screening,
    CinemaTicket,
    MovieReview
}; 