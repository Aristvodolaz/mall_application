const express = require('express');
const router = express.Router();
const { Review, User } = require('../../models');
const auth = require('../../middleware/auth');

// Получение отзывов для магазина
router.get('/shop/:shopId', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { shop_id: req.params.shopId },
            include: [{
                model: User,
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание отзыва
router.post('/', auth, async (req, res) => {
    try {
        const { shop_id, rating, comment } = req.body;

        // Проверка на существующий отзыв
        const existingReview = await Review.findOne({
            where: {
                user_id: req.user.id,
                shop_id
            }
        });

        if (existingReview) {
            return res.status(400).json({ error: 'Вы уже оставили отзыв для этого магазина' });
        }

        const review = await Review.create({
            user_id: req.user.id,
            shop_id,
            rating,
            comment
        });

        const reviewWithUser = await Review.findByPk(review.id, {
            include: [{
                model: User,
                attributes: ['name']
            }]
        });

        res.status(201).json(reviewWithUser);
    } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление отзыва
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (!review) {
            return res.status(404).json({ error: 'Отзыв не найден' });
        }

        await review.destroy();
        res.json({ message: 'Отзыв успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router; 