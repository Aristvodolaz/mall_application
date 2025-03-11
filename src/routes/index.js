const express = require('express');
const router = express.Router();

// Главная страница
router.get('/', async (req, res) => {
    try {
        res.json({
            message: 'Добро пожаловать в API торгового центра',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                shops: '/api/shops',
                events: '/api/events',
                tickets: '/api/tickets',
                reviews: '/api/reviews',
                promotions: '/api/promotions',
                users: '/api/users'
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router; 