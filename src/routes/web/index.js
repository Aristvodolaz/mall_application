const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { Movie, Screening, Event, Promotion, User, CinemaTicket, Shop, MovieReview } = require('../../models');
const { Op } = require('sequelize');

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
                shop: p.Shop ? p.Shop.name : null
            })), null, 2));
        }

        // Получаем популярные магазины
        const shops = await Shop.findAll({
            limit: 6,
            include: [{
                model: Promotion,
                where: {
                    end_date: {
                        [Op.gte]: new Date()
                    }
                },
                required: false
            }],
            order: [['id', 'ASC']]
        });
        console.log(`Загружено магазинов: ${shops ? shops.length : 0}`);
        if (shops && shops.length > 0) {
            console.log('Данные магазинов:', JSON.stringify(shops.map(s => ({
                id: s.id,
                name: s.name,
                logo_url: s.logo_url,
                category: s.category,
                floor: s.floor,
                promotions: s.Promotions ? s.Promotions.length : 0
            })), null, 2));
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

// Обработка 404 ошибки
router.use((req, res) => {
    res.status(404).render('pages/errors/404', {
        title: 'Страница не найдена',
        user: req.session.user || null
    });
});

module.exports = router; 