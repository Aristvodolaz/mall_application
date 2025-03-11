const Sequelize = require('sequelize');
const config = require('./database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions
    }
);

// Проверка подключения
sequelize.authenticate()
    .then(() => {
        console.log('Подключение к базе данных установлено');
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
    });

module.exports = sequelize; 