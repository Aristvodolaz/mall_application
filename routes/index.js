const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

// Главная страница
router.get('/', async (req, res) => {
    try {
        // Получение данных для главной страницы
        const events = await Event.findAll({ 
            where: { 
                date: { 
                    [Op.gte]: new Date() 
                } 
            },
            limit: 6,
            order: [['date', 'ASC']]
        });

        const promotions = await Promotion.findAll({
            where: {
                end_date: {
                    [Op.gte]: new Date()
                }
            },
            limit: 4,
            order: [['end_date', 'ASC']]
        });

        res.render('pages/index', {
            title: 'Главная',
            events,
            promotions
        });
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        req.flash('error_msg', 'Ошибка загрузки данных');
        res.redirect('/error');
    }
});

// Страница "Как добраться"
router.get('/how-to-get', (req, res) => {
    res.render('pages/how-to-get', {
        title: 'Как добраться',
        apiKey: process.env.GOOGLE_MAPS_API_KEY
    });
});

// Страница контактов
router.get('/contacts', (req, res) => {
    res.render('pages/contacts', {
        title: 'Контакты'
    });
});

// Страница чата с администрацией
router.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('pages/chat', {
        title: 'Чат с администрацией',
        userId: req.user.id
    });
});

module.exports = router; 