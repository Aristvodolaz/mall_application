const express = require('express');
const router = express.Router();

// Регистрация
router.post('/register', (req, res) => {
    res.json({ message: 'Маршрут регистрации' });
});

// Вход
router.post('/login', (req, res) => {
    res.json({ message: 'Маршрут входа' });
});

module.exports = router; 