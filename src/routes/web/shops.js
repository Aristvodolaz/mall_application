const express = require('express');
const router = express.Router();
const { Shop, Review, User } = require('../../models');
const { Op } = require('sequelize');

console.log('Инициализация маршрутизатора магазинов...');

// Тестовый маршрут
router.get('/test', (req, res) => {
    console.log('Тестовый маршрут /shops/test');
    try {
        res.render('pages/shops/test', {
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
        const where = {};
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
        console.log(`Найдено магазинов: ${shops.length}`);

        if (shops.length > 0) {
            console.log('Пример первого магазина:', JSON.stringify(shops[0].toJSON(), null, 2));
        }

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
                reviewsCount: reviews.length,
                rating: averageRating || 0,
                main_image: shopData.image_url || shopData.logo_url
            };
        });

        console.log('Подготовка данных для рендеринга...');
        console.log('Путь к шаблону:', 'pages/shops/index');
        console.log('Данные для рендеринга:', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shopsCount: shopsWithRatings.length,
            hasUser: !!req.session.user,
            filters: {
                category: category || '',
                floor: floor || '',
                search: search || ''
            }
        });

        res.render('pages/shops/index', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shops: shopsWithRatings,
            user: req.session.user || null,
            filters: {
                category: category || '',
                floor: floor || '',
                search: search || ''
            }
        });
        console.log('Рендеринг успешно завершен');
    } catch (error) {
        console.error('Ошибка при получении списка магазинов:');
        console.error('Тип ошибки:', error.name);
        console.error('Сообщение:', error.message);
        console.error('Стек вызовов:', error.stack);
        
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка магазинов',
            error,
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