const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { Movie, Screening, Event, Promotion,CinemaTicket, Shop } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Главная страница
router.get('/', async (req, res) => {
    try {
        console.log('Начинаю загрузку данных для главной страницы');
        
        // Получаем текущие фильмы
        const movies = await Movie.findAll({
            where: { is_active: true },
            limit: 6,
            order: [['release_date', 'DESC']]
        });
        console.log(`Загружено фильмов: ${movies.length}`);
        console.log('Данные фильмов:', JSON.stringify(movies.map(m => ({ id: m.id, title: m.title })), null, 2));

        // Получаем ближайшие события
        const events = await Event.findAll({
            where: {
                date: {
                    [Op.gte]: new Date()
                }
            },
            limit: 4,
            order: [['date', 'ASC']]
        });
        console.log(`Загружено событий: ${events.length}`);
        console.log('Данные событий:', JSON.stringify(events.map(e => ({ id: e.id, title: e.title, date: e.date })), null, 2));

        // Получаем активные акции
        const promotions = await Promotion.findAll({
            where: {
                end_date: {
                    [Op.gte]: new Date()
                }
            },
            include: [{
                model: Shop,
                as: 'shop',
                attributes: ['id', 'name']
            }],
            limit: 3,
            order: [['end_date', 'ASC']]
        });
        console.log(`Загружено акций: ${promotions.length}`);
        if (promotions && promotions.length > 0) {
            console.log('Данные акций:', JSON.stringify(promotions.map(p => ({
                id: p.id,
                title: p.title,
                end_date: p.end_date,
                shop: p.shop ? p.shop.name : null
            })), null, 2));
        }

        // Получаем популярные магазины
        console.log('Загрузка популярных магазинов...');
        const shops = await Shop.findAll({
            limit: 6,
            include: [{
                model: Promotion,
                as: 'promotions',
                required: false
            }],
            order: [['id', 'ASC']]
        });

        console.log('Загружено магазинов:', shops ? shops.length : 0);
        if (shops && shops.length > 0) {
            console.log('Данные магазинов:', shops.map(shop => ({
                id: shop.id,
                name: shop.name,
                category: shop.category,
                floor: shop.floor
            })));
        } else {
            console.log('Магазины не найдены');
        }

        res.render('pages/index', {
            title: 'Главная - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            movies,
            events,
            promotions,
            shops: shops || []
        });
    } catch (error) {
        console.error('Ошибка при загрузке главной страницы:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке главной страницы',
            error,
            user: req.session.user || null
        });
    }
});

// Страница кинотеатра
router.get('/cinema', async (req, res) => {
    try {
        const { genre, date, rating } = req.query;
        const filters = { genre, date, rating };
        
        const movies = await Movie.findAll({
            where: { is_active: true },
            include: [{
                model: Screening,
                where: {
                    date: {
                        [Op.gte]: new Date()
                    }
                },
                required: false
            }],
            order: [['release_date', 'DESC']]
        });

        // Получаем уникальные даты сеансов
        const screenings = await Screening.findAll({
            where: {
                date: {
                    [Op.gte]: new Date()
                }
            },
            attributes: ['date'],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        const screeningDates = screenings.map(s => ({ date: s.date }));

        res.render('pages/cinema/index', {
            title: 'Кинотеатр',
            user: req.session.user || null,
            movies,
            filters,
            screeningDates
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы кинотеатра:', error);
        res.status(500).render('pages/errors/500', {
            title: 'Ошибка сервера',
            user: req.session.user || null
        });
    }
});

// Страница магазинов
router.get('/shops', async (req, res) => {
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
            order: [['name', 'ASC']]
        });

        res.render('pages/shops/index', {
            title: 'Магазины - ТРЦ \'Кристалл\'',
            shops,
            user: req.session.user || null,
            path: '/shops',
            filters: {
                category: category || '',
                floor: floor || '',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка магазинов:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка магазинов',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница событий
router.get('/events', async (req, res) => {
    try {
        const { category, date, search } = req.query;
        const where = {
            date: {
                [Op.gte]: new Date()
            }
        };

        if (category) {
            where.category = category;
        }

        if (date) {
            where.date = {
                [Op.gte]: new Date(date),
                [Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            };
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const events = await Event.findAll({
            where,
            order: [['date', 'ASC']]
        });

        res.render('pages/events/index', {
            title: 'События - ТРЦ \'Кристалл\'',
            events,
        
            user: req.session.user || null,
            path: '/events',
            filters: {
                category: category || '',
                date: date || '',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка событий:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка событий',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница с деталями фильма
router.get('/cinema/movies/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await Movie.findByPk(movieId);

        if (!movie) {
            return res.status(404).render('pages/error', {
                title: 'Фильм не найден',
                message: 'Запрашиваемый фильм не найден',
                user: req.session.user || null
            });
        }

        const movieData = movie.toJSON();
        movieData.rating = 0;
        movieData.reviewsCount = 0;
        movieData.reviews = [];

        res.render('pages/cinema/movie-details', {
            title: `${movie.title} - Кинотеатр`,
            movie: movieData,
            screeningsByDate: {},
            user: req.session.user || null
        });

    } catch (error) {
        console.error('Ошибка при загрузке страницы фильма:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Произошла ошибка при загрузке страницы фильма',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница выбора мест (поддержка обоих URL форматов)
router.get(['/cinema/screening/:id', '/cinema/screenings/:id'], auth, async (req, res) => {
    try {
        const screening = await Screening.findByPk(req.params.id, {
            include: [{ 
                model: Movie,
                attributes: ['id', 'title', 'poster_url', 'duration', 'age_restriction']
            }]
        });

        if (!screening) {
            return res.status(404).render('pages/errors/404', {
                title: 'Страница не найдена',
                user: req.session.user || null
            });
        }

        // Проверяем, не устарел ли сеанс
        if (new Date(screening.date) < new Date()) {
            return res.status(404).render('pages/errors/404', {
                title: 'Сеанс недоступен',
                user: req.session.user || null,
                message: 'Этот сеанс уже прошел'
            });
        }

        res.render('pages/cinema/seat-selection', {
            title: `Выбор мест - ${screening.Movie.title}`,
            user: req.session.user || null,
            screening,
            movie: screening.Movie
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы выбора мест:', error);
        res.status(500).render('pages/errors/500', {
            title: 'Ошибка сервера',
            user: req.session.user || null
        });
    }
});

// Страница с билетами пользователя
router.get('/cinema/tickets', auth, async (req, res) => {
    try {
        const tickets = await CinemaTicket.findAll({
            where: { userId: req.session.user.id },
            include: [{
                model: Screening,
                include: [{ model: Movie }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('pages/cinema/tickets', {
            title: 'Мои билеты',
            user: req.session.user || null,
            tickets
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы билетов:', error);
        res.status(500).render('pages/errors/500', {
            title: 'Ошибка сервера',
            user: req.session.user || null
        });
    }
});

// Страница карты
router.get('/map', (req, res) => {
    res.render('pages/mall-map', {
        title: 'Карта - ТРЦ \'Кристалл\'',
        user: req.session.user || null
    });
});

// Страница контактов
router.get('/contacts', (req, res) => {
    res.render('pages/contacts', {
        title: 'Контакты - ТРЦ \'Кристалл\'',
        user: req.session.user || null
    });
});

// Страница "О нас"
router.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'О нас',
        user: req.session.user || null
    });
});

// Страница профиля пользователя
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id, {
            include: [{
                model: CinemaTicket,
                include: [{
                    model: Screening,
                    include: [{ model: Movie }]
                }]
            }]
        });

        res.render('pages/profile', {
            title: 'Профиль',
            user: user
        });
    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        res.status(500).render('pages/errors/500', {
            title: 'Ошибка сервера',
            user: req.session.user || null
        });
    }
});

// Страница настроек
router.get('/settings', auth, (req, res) => {
    res.render('pages/settings', {
        title: 'Настройки',
        user: req.session.user || null
    });
});

// Страница авторизации
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/auth/login', {
        title: 'Вход',
        user: null
    });
});

// Страница регистрации
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/auth/register', {
        title: 'Регистрация',
        user: null
    });
});

// Выход из системы
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Страница со всей информацией
router.get('/all', async (req, res) => {
    try {
        console.log('Загрузка всей информации...');

        // Получаем магазины
        const shops = await Shop.findAll({
            order: [['name', 'ASC']],
            limit: 6
        });
        console.log(`Найдено ${shops.length} магазинов`);

        // Получаем предстоящие события
        const events = await Event.findAll({
            where: {
                date: {
                    [Op.gte]: new Date()
                }
            },
            order: [['date', 'ASC']],
            limit: 3
        });
        console.log(`Найдено ${events.length} событий`);

        // Получаем активные акции
        const promotions = await Promotion.findAll({
            where: {
                end_date: {
                    [Op.gte]: new Date()
                }
            },
            order: [['end_date', 'ASC']],
            limit: 3
        });
        console.log(`Найдено ${promotions.length} акций`);

        res.render('pages/all/index', {
            title: 'Вся информация - ТРЦ \'Кристалл\'',
            shops,
            events,
            promotions,
        
            user: req.session.user || null,
            path: '/all'
        });
        console.log('Рендеринг успешно завершен');
    } catch (error) {
        console.error('Ошибка при получении информации:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке информации',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница акций
router.get('/promotions', async (req, res) => {
    try {
        const { shop, search } = req.query;
        const where = {
            end_date: {
                [Op.gte]: new Date()
            }
        };

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
                attributes: ['id', 'name'],
                where: shop ? { id: shop } : undefined
            }],
            order: [['end_date', 'ASC']]
        });

        // Получаем список магазинов для фильтра
        const shops = await Shop.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.render('pages/promotions/index', {
            title: 'Акции - ТРЦ \'Кристалл\'',
            promotions,
            shops,
            user: req.session.user || null,
            path: '/promotions',
            filters: {
                shop: shop || '',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка акций:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка акций',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Административная панель
router.get('/admin', async (req, res) => {
    try {
        // Получаем статистику
        const [
            shopsCount,
            eventsCount,
            promotionsCount,
            moviesCount,
            screeningsCount,
            ticketsCount
        ] = await Promise.all([
            Shop.count(),
            Event.count(),
            Promotion.count(),
            Movie.count(),
            Screening.count(),
            CinemaTicket.count()
        ]);

        // Получаем последние добавленные сущности
        const [
            latestShops,
            latestEvents,
            latestPromotions
        ] = await Promise.all([
            Shop.findAll({
                limit: 5,
                order: [['created_at', 'DESC']]
            }),
            Event.findAll({
                where: {
                    date: {
                        [Op.gte]: new Date()
                    }
                },
                limit: 5,
                order: [['date', 'ASC']]
            }),
            Promotion.findAll({
                where: {
                    end_date: {
                        [Op.gte]: new Date()
                    }
                },
                include: [{
                    model: Shop,
                    attributes: ['id', 'name']
                }],
                limit: 5,
                order: [['end_date', 'ASC']]
            })
        ]);

        res.render('pages/admin/index', {
            title: 'Административная панель - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            path: '/admin',
            stats: {
                shops: shopsCount,
                events: eventsCount,
                promotions: promotionsCount,
                movies: moviesCount,
                screenings: screeningsCount,
                tickets: ticketsCount
            },
            latest: {
                shops: latestShops,
                events: latestEvents,
                promotions: latestPromotions
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке административной панели:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке административной панели',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание нового магазина
router.get('/admin/shops/create', async (req, res) => {
    try {
        res.render('pages/admin/shops/create', {
            title: 'Добавить магазин - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            path: '/admin/shops/create'
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы создания магазина:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке формы создания магазина',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание нового события
router.get('/admin/events/create', async (req, res) => {
    try {
        res.render('pages/admin/events/create', {
            title: 'Добавить событие - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            path: '/admin/events/create'
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы создания события:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке формы создания события',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание новой акции
router.get('/admin/promotions/create', async (req, res) => {
    try {
        const shops = await Shop.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.render('pages/admin/promotions/create', {
            title: 'Добавить акцию - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            path: '/admin/promotions/create',
            shops
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы создания акции:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке формы создания акции',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание нового фильма
router.get('/admin/movies/create', async (req, res) => {
    try {
        res.render('pages/admin/movies/create', {
            title: 'Добавить фильм - ТРЦ \'Кристалл\'',
            user: req.session.user || null,
            path: '/admin/movies/create'
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы создания фильма:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке формы создания фильма',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Обработка POST-запросов для создания записей

// Создание магазина
router.post('/admin/shops/create', async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        res.redirect('/admin/shops');
    } catch (error) {
        console.error('Ошибка при создании магазина:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при создании магазина',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание события
router.post('/admin/events/create', async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.redirect('/admin/events');
    } catch (error) {
        console.error('Ошибка при создании события:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при создании события',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание акции
router.post('/admin/promotions/create', async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);
        res.redirect('/admin/promotions');
    } catch (error) {
        console.error('Ошибка при создании акции:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при создании акции',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Создание фильма
router.post('/admin/movies/create', async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.redirect('/admin/movies');
    } catch (error) {
        console.error('Ошибка при создании фильма:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при создании фильма',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Обработка 404 ошибки
router.use((req, res) => {
    res.status(404).render('pages/errors/404', {
        title: 'Страница не найдена',
        user: req.session.user || null
    });
});

module.exports = router; 