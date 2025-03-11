const express = require('express');
const router = express.Router();

// Получение списка магазинов
router.get('/', (req, res) => {
    res.json({ message: 'Список магазинов' });
});

// Получение конкретного магазина
router.get('/:id', (req, res) => {
    res.json({ message: `Информация о магазине ${req.params.id}` });
});

module.exports = router; 