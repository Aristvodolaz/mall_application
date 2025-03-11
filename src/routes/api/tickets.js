const express = require('express');
const router = express.Router();
const { Ticket, Event, User } = require('../../models');
const auth = require('../../middleware/auth');

// Получение билетов пользователя
router.get('/my', auth, async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { user_id: req.session.user.id },
            include: [{
                model: Event,
                attributes: ['title', 'date', 'time', 'location']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Ошибка при получении билетов:', error);
        res.status(500).json({ error: 'Ошибка при получении билетов' });
    }
});

// Бронирование билета
router.post('/', auth, async (req, res) => {
    try {
        const { event_id, quantity } = req.body;
        
        // Проверяем существование события
        const event = await Event.findByPk(event_id);
        if (!event) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }
        
        // Проверяем наличие свободных мест
        const bookedTickets = await Ticket.sum('quantity', {
            where: { event_id }
        });
        
        if (bookedTickets + quantity > event.total_tickets) {
            return res.status(400).json({ error: 'Недостаточно свободных мест' });
        }
        
        // Создаем билет
        const ticket = await Ticket.create({
            user_id: req.session.user.id,
            event_id,
            quantity,
            total_price: event.price * quantity,
            status: 'pending'
        });
        
        res.json(ticket);
    } catch (error) {
        console.error('Ошибка при бронировании билета:', error);
        res.status(500).json({ error: 'Ошибка при бронировании билета' });
    }
});

// Отмена бронирования
router.delete('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: {
                id: req.params.id,
                user_id: req.session.user.id
            }
        });
        
        if (!ticket) {
            return res.status(404).json({ error: 'Билет не найден' });
        }
        
        // Проверяем, можно ли отменить бронирование
        const event = await Event.findByPk(ticket.event_id);
        const eventDate = new Date(event.date);
        const now = new Date();
        const hoursDiff = (eventDate - now) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            return res.status(400).json({ error: 'Бронирование можно отменить не позднее чем за 24 часа до начала события' });
        }
        
        await ticket.destroy();
        res.json({ message: 'Бронирование успешно отменено' });
    } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        res.status(500).json({ error: 'Ошибка при отмене бронирования' });
    }
});

module.exports = router; 