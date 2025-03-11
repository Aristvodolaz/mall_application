const express = require('express');
const router = express.Router();

// Получение списка билетов пользователя
router.get('/', (req, res) => {
    res.json({ message: 'Список билетов' });
});

// Покупка билета
router.post('/', (req, res) => {
    res.json({ message: 'Покупка билета' });
});

module.exports = router; 