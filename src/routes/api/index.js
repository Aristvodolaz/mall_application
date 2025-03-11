const express = require('express');
const router = express.Router();

// Тестовый маршрут
router.get('/test', (req, res) => {
    res.json({ message: 'API работает' });
});

// Подключаем маршруты по одному
const routes = {
    auth: './auth',
    shops: './shops',
    events: './events',
    tickets: './tickets',
    reviews: './reviews',
    promotions: './promotions',
    users: './users',

};

// Подключаем каждый маршрут с проверкой
for (const [name, path] of Object.entries(routes)) {
    try {
        const route = require(path);
        if (!route || typeof route !== 'function') {
            console.error(`Route ${name} is not a valid middleware function:`, typeof route);
            continue;
        }
        router.use(`/${name}`, route);
        console.log(`Route ${name} loaded successfully`);
    } catch (error) {
        console.error(`Error loading route ${name}:`, error);
    }
}

// Экспортируем как функцию middleware
module.exports = function(req, res, next) {
    return router(req, res, next);
}; 