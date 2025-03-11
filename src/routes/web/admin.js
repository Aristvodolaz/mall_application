const express = require('express');
const router = express.Router();
const { Shop, Promotion, Event, Movie } = require('../../models');
const multer = require('multer');
const path = require('path');

// Настройка загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'public/images/';
        if (file.fieldname === 'shop_logo') folder += 'shops/';
        else if (file.fieldname === 'promotion_image') folder += 'promotions/';
        else if (file.fieldname === 'event_image') folder += 'events/';
        else if (file.fieldname === 'movie_poster') folder += 'movies/';
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Главная страница админки
router.get('/', async (req, res) => {
    try {
        const [shops, promotions, events, movies] = await Promise.all([
            Shop.count(),
            Promotion.count(),
            Event.count(),
            Movie.count()
        ]);

        res.render('pages/admin/dashboard', {
            title: 'Админ-панель',
            counts: { shops, promotions, events, movies }
        });
    } catch (error) {
        console.error('Ошибка при загрузке дашборда:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке дашборда'
        });
    }
});

// Магазины
router.get('/shops', async (req, res) => {
    try {
        const shops = await Shop.findAll();
        res.render('pages/admin/shops/index', {
            title: 'Управление магазинами',
            shops
        });
    } catch (error) {
        console.error('Ошибка при загрузке магазинов:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке списка магазинов'
        });
    }
});

router.get('/shops/create', (req, res) => {
    res.render('pages/admin/shops/form', {
        title: 'Добавление магазина',
        shop: null
    });
});

router.post('/shops/create', upload.single('shop_logo'), async (req, res) => {
    try {
        const shopData = {
            ...req.body,
            logo_url: req.file ? `/images/shops/${req.file.filename}` : null,
            is_active: true
        };
        await Shop.create(shopData);
        res.redirect('/admin/shops');
    } catch (error) {
        console.error('Ошибка при создании магазина:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при создании магазина'
        });
    }
});

// Акции
router.get('/promotions', async (req, res) => {
    try {
        const promotions = await Promotion.findAll({
            include: [{ model: Shop, as: 'shop' }]
        });
        res.render('pages/admin/promotions/index', {
            title: 'Управление акциями',
            promotions
        });
    } catch (error) {
        console.error('Ошибка при загрузке акций:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке списка акций'
        });
    }
});

router.get('/promotions/create', async (req, res) => {
    try {
        const shops = await Shop.findAll();
        res.render('pages/admin/promotions/form', {
            title: 'Добавление акции',
            promotion: null,
            shops
        });
    } catch (error) {
        console.error('Ошибка при загрузке формы акции:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке формы акции'
        });
    }
});

router.post('/promotions/create', upload.single('promotion_image'), async (req, res) => {
    try {
        const promotionData = {
            ...req.body,
            image_url: req.file ? `/images/promotions/${req.file.filename}` : null,
            is_active: true
        };
        await Promotion.create(promotionData);
        res.redirect('/admin/promotions');
    } catch (error) {
        console.error('Ошибка при создании акции:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при создании акции'
        });
    }
});

// События
router.get('/events', async (req, res) => {
    try {
        const events = await Event.findAll();
        res.render('pages/admin/events/index', {
            title: 'Управление событиями',
            events
        });
    } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке списка событий'
        });
    }
});

router.get('/events/create', (req, res) => {
    res.render('pages/admin/events/form', {
        title: 'Добавление события',
        event: null
    });
});

router.post('/events/create', upload.single('event_image'), async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            image_url: req.file ? `/images/events/${req.file.filename}` : null,
            is_active: true
        };
        await Event.create(eventData);
        res.redirect('/admin/events');
    } catch (error) {
        console.error('Ошибка при создании события:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при создании события'
        });
    }
});

// Фильмы
router.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.render('pages/admin/movies/index', {
            title: 'Управление фильмами',
            movies
        });
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при загрузке списка фильмов'
        });
    }
});

router.get('/movies/create', (req, res) => {
    res.render('pages/admin/movies/form', {
        title: 'Добавление фильма',
        movie: null
    });
});

router.post('/movies/create', upload.single('movie_poster'), async (req, res) => {
    try {
        const movieData = {
            ...req.body,
            poster_url: req.file ? `/images/movies/${req.file.filename}` : null,
            is_active: true
        };
        await Movie.create(movieData);
        res.redirect('/admin/movies');
    } catch (error) {
        console.error('Ошибка при создании фильма:', error);
        res.status(500).render('pages/error', {
            message: 'Ошибка при создании фильма'
        });
    }
});

module.exports = router; 