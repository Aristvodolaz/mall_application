const express = require('express');
const router = express.Router();

// Получение профиля пользователя
router.get('/profile', (req, res) => {
    res.json({ message: 'Профиль пользователя' });
});

// Обновление профиля
router.put('/profile', (req, res) => {
    res.json({ message: 'Обновление профиля' });
});

module.exports = router; 