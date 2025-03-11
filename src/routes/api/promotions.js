const express = require('express');
const router = express.Router();
const { Promotion, Shop } = require('../../models');
const { Op } = require('sequelize');

// Получение списка акций
router.get('/', async (req, res) => {
    try {
        const { category, shop_id, search } = req.query;
        const where = {
            end_date: {
                [Op.gte]: new Date()
            },
            is_active: true
        };

        if (category) {
            where.category = category;
        }

        if (shop_id) {
            where.shop_id = shop_id;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const promotions = await Promotion.findAll({
            where,
            include: [{
                model: Shop,
                attributes: ['id', 'name', 'logo_url']
            }],
            order: [['start_date', 'DESC']]
        });

        res.json(promotions);
    } catch (error) {
        console.error('Ошибка при получении акций:', error);
        res.status(500).json({ error: 'Ошибка при получении акций' });
    }
});

// Получение деталей акции
router.get('/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findByPk(req.params.id, {
            include: [{
                model: Shop,
                attributes: ['id', 'name', 'logo_url', 'description']
            }]
        });

        if (!promotion) {
            return res.status(404).json({ error: 'Акция не найдена' });
        }

        res.json(promotion);
    } catch (error) {
        console.error('Ошибка при получении акции:', error);
        res.status(500).json({ error: 'Ошибка при получении акции' });
    }
});

// Получение акций магазина
router.get('/shop/:shopId', async (req, res) => {
    try {
        const promotions = await Promotion.findAll({
            where: {
                shop_id: req.params.shopId,
                end_date: {
                    [Op.gte]: new Date()
                },
                is_active: true
            },
            order: [['start_date', 'DESC']]
        });

        res.json(promotions);
    } catch (error) {
        console.error('Ошибка при получении акций магазина:', error);
        res.status(500).json({ error: 'Ошибка при получении акций магазина' });
    }
});

module.exports = router; 