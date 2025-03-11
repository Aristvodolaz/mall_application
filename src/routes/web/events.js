const express = require('express');
const router = express.Router();
const { Event, Ticket } = require('../../models');
const { Op } = require('sequelize');

// Список событий
router.get('/', async (req, res) => {
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
            order: [['date', 'ASC']],
            include: [{
                model: Ticket,
                attributes: ['id'],
                required: false
            }]
        });

        // Добавляем количество проданных билетов
        events.forEach(event => {
            event.dataValues.ticketsSold = event.Tickets.length;
        });

        res.render('pages/events/index', {
            title: 'События - ТРЦ \'Кристалл\'',
            events,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Ошибка при получении списка событий:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка событий',
            error,
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