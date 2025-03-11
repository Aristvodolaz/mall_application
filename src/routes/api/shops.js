const express = require('express');
const router = express.Router();
const { Shop, Review, User } = require('../../models');
const { Op } = require('sequelize');

// Получение списка магазинов
router.get('/', async (req, res) => {
    try {
        const { category, floor, search } = req.query;
        const where = {};

        if (category) {
            where.category = category;
        }

        if (floor) {
            where.floor = floor;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const shops = await Shop.findAll({
            where,
            include: [{
                model: Review,
                attributes: ['rating'],
                required: false
            }],
            order: [['name', 'ASC']]
        });

        // Добавляем средний рейтинг для каждого магазина
        shops.forEach(shop => {
            shop.dataValues.avgRating = shop.Reviews.length > 0
                ? shop.Reviews.reduce((sum, review) => sum + review.rating, 0) / shop.Reviews.length
                : 0;
        });

        res.json(shops);
    } catch (error) {
        console.error('Ошибка при получении списка магазинов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение магазина по ID
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, {
            include: [{
                model: Review,
                include: [{
                    model: User,
                    attributes: ['name']
                }],
                order: [['created_at', 'DESC']]
            }]
        });

        if (!shop) {
            return res.status(404).json({ error: 'Магазин не найден' });
        }

        // Вычисляем средний рейтинг
        shop.dataValues.avgRating = shop.Reviews.length > 0
            ? shop.Reviews.reduce((sum, review) => sum + review.rating, 0) / shop.Reviews.length
            : 0;

        res.json(shop);
    } catch (error) {
        console.error('Ошибка при получении магазина:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router; 