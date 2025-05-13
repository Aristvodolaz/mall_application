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

const models = {
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

// Вызываем associate для каждой модели
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

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
    ...models
}; 