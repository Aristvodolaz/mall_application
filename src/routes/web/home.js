const express = require('express');
const router = express.Router();
const { Shop, Event, Promotion } = require('../../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const [events, promotions] = await Promise.all([
            Event.findAll({
                where: {
                    date: {
                        [Op.gte]: new Date()
                    }
                },
                order: [['date', 'ASC']],
                limit: 3
            }),
            Promotion.findAll({
                where: {
                    end_date: {
                        [Op.gte]: new Date()
                    },
                    is_active: true
                },
                include: [{
                    model: Shop,
                    attributes: ['name']
                }],
                order: [['end_date', 'ASC']],
                limit: 4
            })
        ]);

        res.render('pages/index', {
            title: 'Главная',
            events,
            promotions
        });
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        res.status(500).render('errors/500', {
            title: 'Ошибка сервера'
        });
    }
});

module.exports = router; 