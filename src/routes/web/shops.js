const express = require('express');
const router = express.Router();

const { Shop} = require('../../models');
const { Op } = require('sequelize');

console.log('Инициализация маршрутизатора магазинов...');

// Тестовый маршрут
router.get('/test', (req, res) => {
    console.log('Тестовый маршрут /shops/test');
    try {
        res.render('views/shops', {
            title: 'Тест - ТРЦ \'Кристалл\''
        });
        console.log('Рендеринг тестовой страницы успешно завершен');
    } catch (error) {
        console.error('Ошибка при рендеринге тестовой страницы:', error);
        res.status(500).send('Ошибка при рендеринге страницы');
    }
});

// Список магазинов
router.get('/', async (req, res) => {
    console.log('Получен запрос на страницу магазинов');
    try {
        const { category, floor, search } = req.query;
  
        console.log('Параметры запроса:', { category, floor, search });

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

        console.log('Условия поиска:', JSON.stringify(where));

        console.log('Начинаем поиск магазинов...');
        const shops = await Shop.findAll({
            where,
            order: [['name', 'ASC']]
        });
        console.log(`Найдено магазинов: ${shops.length}`);

        res.render('pages/shops/index', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shops: shops,
            user: req.session.user || null,
            path: '/shops'
        });
        console.log('Рендеринг успешно завершен');
    } catch (error) {
        console.error('Ошибка при получении списка магазинов:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка магазинов',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница деталей магазина
router.get('/:id', async (req, res) => {
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

        res.render('pages/shops/show', {
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