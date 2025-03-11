const express = require('express');
const router = express.Router();

// Получение списка акций
router.get('/', (req, res) => {
    res.json({ message: 'Список акций' });
});

// Получение акций магазина
router.get('/shop/:shopId', (req, res) => {
    res.json({ message: `Акции магазина ${req.params.shopId}` });
});

module.exports = router; 