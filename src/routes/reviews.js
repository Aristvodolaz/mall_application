const express = require('express');
const router = express.Router();

// Получение отзывов магазина
router.get('/shop/:shopId', (req, res) => {
    res.json({ message: `Отзывы магазина ${req.params.shopId}` });
});

// Добавление отзыва
router.post('/', (req, res) => {
    res.json({ message: 'Добавление отзыва' });
});

module.exports = router; 