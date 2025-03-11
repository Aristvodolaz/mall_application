const express = require('express');
const router = express.Router();

// Маршрут для страницы с 3D моделью ТЦ
router.get('/map', (req, res) => {
    const user = req.session.user || null;
    
    res.render('pages/mall-map', {
        title: 'Карта ТЦ - ТРЦ "Кристалл"',
        user,
        path: '/map'
    });
});

module.exports = router; 