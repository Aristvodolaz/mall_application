const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Получение списка всех магазинов
router.get('/shops', async (req, res) => {
    try {
        const { category, floor, sort } = req.query;
        let where = {};
        let order = [];

        // Фильтрация по категории
        if (category) {
            where.category = category;
        }

        // Фильтрация по этажу
        if (floor) {
            where.floor = floor;
        }

        // Сортировка
        if (sort) {
            switch (sort) {
                case 'rating':
                    order.push(['rating', 'DESC']);
                    break;
                case 'name':
                    order.push(['name', 'ASC']);
                    break;
                // Добавьте другие варианты сортировки при необходимости
            }
        }

        const shops = await Shop.findAll({
            where,
            order,
            attributes: ['id', 'name', 'category', 'floor', 'location', 'rating', 'logo']
        });

        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка магазинов', error: error.message });
    }
});

// Получение информации о конкретном магазине
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Магазин не найден' });
        }
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении информации о магазине', error: error.message });
    }
});

// Добавление отзыва к магазину
router.post('/:id/reviews', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const shop = await Shop.findByPk(req.params.id);
        
        if (!shop) {
            return res.status(404).json({ message: 'Магазин не найден' });
        }

        // Здесь должна быть логика добавления отзыва
        // Предполагается, что есть модель Review
        const review = await Review.create({
            shopId: shop.id,
            userId: req.user.id,
            rating,
            comment
        });

        // Обновление рейтинга магазина
        const reviews = await Review.findAll({ where: { shopId: shop.id } });
        const newRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await shop.update({
            rating: newRating,
            reviewCount: reviews.length
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при добавлении отзыва', error: error.message });
    }
});

// Получение категорий магазинов
router.get('/categories', async (req, res) => {
    try {
        const categories = await Shop.findAll({
            attributes: ['category'],
            group: ['category']
        });
        res.json(categories.map(c => c.category));
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении категорий', error: error.message });
    }
});

// Получение этажей с магазинами
router.get('/floors', async (req, res) => {
    try {
        const floors = await Shop.findAll({
            attributes: ['floor'],
            group: ['floor'],
            order: [['floor', 'ASC']]
        });
        res.json(floors.map(f => f.floor));
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка этажей', error: error.message });
    }
});

module.exports = router; 