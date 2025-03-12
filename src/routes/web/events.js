const express = require('express');
const router = express.Router();
const { Event, Ticket } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Список событий
router.get('/', async (req, res) => {
    try {
        console.log('=== Начало загрузки списка событий ===');
        console.log('Проверка подключения к базе данных...');
        
        // Проверяем подключение к базе данных
        try {
            await Event.sequelize.authenticate();
            console.log('Подключение к базе данных успешно установлено');
        } catch (dbError) {
            console.error('Ошибка подключения к базе данных:', dbError);
            throw dbError;
        }

        const { category, date, search } = req.query;
        const where = {};

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

        console.log('Условия поиска:', JSON.stringify(where));
        console.log('Выполнение запроса к базе данных...');
        
        const events = await Event.findAll({
            where,
            order: [['date', 'ASC']]
        });
        
        console.log('Запрос выполнен успешно');
        console.log('Найденные события:', JSON.stringify(events, null, 2));
        console.log(`Всего найдено событий: ${events.length}`);

        console.log('Рендеринг страницы...');
        res.render('pages/events/index', {
            title: 'События - ТРЦ \'Кристалл\'',
            events,
            moment,
            user: req.session.user || null,
            path: '/events'
        });
        console.log('=== Завершение загрузки списка событий ===');
    } catch (error) {
        console.error('!!! Критическая ошибка при получении списка событий:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка событий',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница деталей события
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [{
                model: Ticket,
                attributes: ['id'],
                required: false
            }]
        });

        if (!event) {
            return res.render('pages/error', {
                title: 'Событие не найдено - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемое событие не найдено',
                user: req.session.user || null
            });
        }

        // Добавляем количество проданных билетов
        event.dataValues.ticketsSold = event.Tickets.length;
        
        // Добавляем количество доступных билетов
        event.dataValues.available_tickets = event.total_tickets - event.dataValues.ticketsSold;

        res.render('pages/events/show', {
            title: `${event.title} - ТРЦ 'Кристалл'`,
            event,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Ошибка при получении деталей события:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей события',
            error,
            user: req.session.user || null
        });
    }
});

module.exports = router; 