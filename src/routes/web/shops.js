const express = require('express');
const router = express.Router();
const { Shop, Review, User } = require('../../models');
const { Op } = require('sequelize');

// Список магазинов
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
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const shops = await Shop.findAll({
            where,
            include: [{
                model: Review,
                as: 'reviews',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }]
            }],
            order: [['name', 'ASC']]
        });

        // Рассчитываем средний рейтинг для каждого магазина
        const shopsWithRatings = shops.map(shop => {
            const shopData = shop.toJSON();
            const reviews = shopData.reviews || [];
            
            // Рассчитываем средний рейтинг
            const averageRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : null;
            
            // Добавляем средний рейтинг и количество отзывов
            return {
                ...shopData,
                averageRating,
                reviewsCount: reviews.length
            };
        });

        res.render('pages/shops', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shops: shopsWithRatings,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Ошибка при получении списка магазинов:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка магазинов',
            error,
            user: req.session.user || null
        });
    }
});

// Страница деталей магазина
router.get('/shops/:id', async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, {
            include: [{
                model: Review,
                as: 'reviews',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }]
            }]
        });

        if (!shop) {
            return res.render('pages/error', {
                title: 'Магазин не найден - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемый магазин не найден',
                user: req.session.user || null
            });
        }

        // Рассчитываем средний рейтинг
        const reviews = shop.reviews || [];
        const averageRating = reviews.length > 0 
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : null;

        res.render('pages/shop-details', {
            title: `${shop.name} - ТРЦ 'Кристалл'`,
            shop: {
                ...shop.toJSON(),
                averageRating,
                reviewsCount: reviews.length
            },
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Ошибка при получении деталей магазина:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей магазина',
            error,
            user: req.session.user || null
        });
    }
});

module.exports = router; 