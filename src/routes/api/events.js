const express = require('express');
const router = express.Router();
const { Event, Ticket } = require('../../models');
const { Op } = require('sequelize');

// Получение списка событий
router.get('/', async (req, res) => {
    try {
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

        const events = await Event.findAll({
            where,
            order: [['date', 'ASC']]
        });

        res.json(events);
    } catch (error) {
        console.error('Ошибка при получении событий:', error);
        res.status(500).json({ error: 'Ошибка при получении событий' });
    }
});

// Получение деталей события
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }

        // Получаем количество проданных билетов
        const ticketsSold = await Ticket.sum('quantity', {
            where: {
                event_id: event.id,
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        });

        // Добавляем информацию о доступных билетах
        const eventData = event.toJSON();
        eventData.tickets_sold = ticketsSold || 0;
        eventData.tickets_available = event.total_tickets - (ticketsSold || 0);

        res.json(eventData);
    } catch (error) {
        console.error('Ошибка при получении события:', error);
        res.status(500).json({ error: 'Ошибка при получении события' });
    }
});

// Получение ближайших событий
router.get('/upcoming', async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {
                date: {
                    [Op.gte]: new Date()
                }
            },
            order: [['date', 'ASC']],
            limit: 5
        });

        res.json(events);
    } catch (error) {
        console.error('Ошибка при получении ближайших событий:', error);
        res.status(500).json({ error: 'Ошибка при получении ближайших событий' });
    }
});

module.exports = router; 