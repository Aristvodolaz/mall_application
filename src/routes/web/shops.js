const express = require('express');
const router = express.Router();

const { Shop, Review, User, Promotion } = require('../../models');
const { Op } = require('sequelize');

console.log('[Shops] Инициализация маршрутизатора магазинов...');

// Отладочный middleware
router.use((req, res, next) => {
    console.log('[Shops] Входящий запрос:', {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query
    });
    next();
});

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
    console.log('[Shops] Получен запрос на список магазинов');
    try {
        const { category, floor, search } = req.query;
        const where = {};
  
        console.log('[Shops] Параметры запроса:', { category, floor, search });

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

        console.log('[Shops] Условия поиска:', JSON.stringify(where));

        const shops = await Shop.findAll({
            where,
            order: [['name', 'ASC']]
        });
        console.log(`[Shops] Найдено магазинов: ${shops.length}`);

        res.render('pages/shops/index', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shops: shops,
            user: req.session.user || null,
            path: '/shops',
            filters: {
                category: category || '',
                floor: floor || '',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('[Shops] Ошибка при получении списка магазинов:', error);
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
    console.log('[Shops] Получен запрос на просмотр магазина:', req.params.id);
    try {
        const shopId = parseInt(req.params.id);
        if (isNaN(shopId)) {
            console.log('[Shops] Некорректный ID магазина:', req.params.id);
            res.status(404);
            return res.render('pages/error', {
                title: 'Магазин не найден - ТРЦ \'Кристалл\'',
                message: 'Некорректный ID магазина',
                user: req.session.user || null
            });
        }

        console.log('[Shops] Поиск магазина в БД:', shopId);
        const shop = await Shop.findByPk(shopId, {
            include: [{
                model: Review,
                as: 'reviews',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }]
            }, {
                model: Promotion,
                as: 'promotions',
                where: {
                    end_date: {
                        [Op.gte]: new Date()
                    },
                    is_active: true
                },
                required: false
            }]
        });
        
        console.log('[Shops] Результат поиска:', shop ? 'Магазин найден' : 'Магазин не найден');

        if (!shop) {
            console.log('[Shops] Магазин не найден в БД:', shopId);
            res.status(404);
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

        console.log('[Shops] Рендеринг страницы магазина:', {
            id: shop.id,
            name: shop.name,
            reviewsCount: reviews.length,
            averageRating
        });

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
        console.error('[Shops] Ошибка при получении деталей магазина:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей магазина',
            error: process.env.NODE_ENV === 'development' ? error : null,
            user: req.session.user || null
        });
    }
});

module.exports = router; 