const express = require('express');
const router = express.Router();
const { Promotion } = require('../../models');
const { Op } = require('sequelize');

// Список всех акций
router.get('/', async (req, res) => {
    try {
        const user = req.session.user || null;
        
        const promotions = await Promotion.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { end_date: { [Op.gte]: new Date() } },
                    { end_date: null }
                ]
            },
            order: [['start_date', 'DESC']]
        });

        res.render('pages/promotions', {
            title: 'Акции - ТРЦ \'Кристалл\'',
            promotions,
            user
        });
    } catch (error) {
        console.error('Ошибка при получении списка акций:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка акций',
            error,
            user: req.session.user || null
        });
    }
});

// Страница деталей акции
router.get('/promotions/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findByPk(req.params.id);
        
        if (!promotion) {
            return res.render('pages/error', {
                title: 'Акция не найдена - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемая акция не найдена',
                user: req.session.user || null
            });
        }
        
        res.render('pages/promotion-details', {
            title: `${promotion.title} - ТРЦ 'Кристалл'`,
            promotion,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Ошибка при получении деталей акции:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей акции',
            error,
            user: req.session.user || null
        });
    }
});

module.exports = router; 