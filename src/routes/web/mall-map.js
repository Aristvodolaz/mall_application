const express = require('express');
const router = express.Router();
const { Shop } = require('../../models');

router.get('/', async (req, res) => {
    try {
        const shops = await Shop.findAll({
            attributes: ['id', 'name', 'category', 'floor', 'logo_url'],
            order: [['name', 'ASC']]
        });

        res.render('pages/mall-map', {
            title: '3D Карта ТРЦ',
            shops
        });
    } catch (error) {
        console.error('Ошибка при загрузке карты:', error);
        res.status(500).render('error', {
            message: 'Ошибка при загрузке карты'
        });
    }
});

module.exports = router; 