const express = require('express');
const router = express.Router();
const passport = require('passport');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const stripe = require('../config/stripe');

// Получение списка всех событий
router.get('/', async (req, res) => {
    try {
        const { category, date, sort } = req.query;
        let where = {};
        let order = [];

        // Фильтрация по категории
        if (category) {
            where.category = category;
        }

        // Фильтрация по дате
        if (date) {
            where.date = {
                [Op.gte]: new Date(date)
            };
        }

        // Сортировка
        if (sort) {
            switch (sort) {
                case 'date':
                    order.push(['date', 'ASC']);
                    break;
                case 'price':
                    order.push(['price', 'ASC']);
                    break;
            }
        }

        const events = await Event.findAll({
            where,
            order,
            attributes: ['id', 'title', 'description', 'date', 'location', 'price', 'image', 'availableTickets']
        });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка событий', error: error.message });
    }
});

// Получение информации о конкретном событии
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Событие не найдено' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении информации о событии', error: error.message });
    }
});

// Покупка билетов
router.post('/:id/tickets', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { quantity, paymentMethodId } = req.body;
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Событие не найдено' });
        }

        if (event.availableTickets < quantity) {
            return res.status(400).json({ message: 'Недостаточно доступных билетов' });
        }

        const totalPrice = event.price * quantity;

        // Создание платежа в Stripe
        const paymentIntent = await stripe.createPayment(totalPrice);

        // Создание билета
        const ticket = await Ticket.create({
            eventId: event.id,
            userId: req.user.id,
            quantity,
            totalPrice,
            paymentId: paymentIntent.id,
            status: 'pending'
        });

        // Обновление количества доступных билетов
        await event.update({
            availableTickets: event.availableTickets - quantity
        });

        // Начисление бонусных баллов (10% от стоимости)
        const bonusPoints = Math.floor(totalPrice * 0.1);
        await req.user.update({
            bonusPoints: req.user.bonusPoints + bonusPoints
        });

        res.status(201).json({
            ticket,
            clientSecret: paymentIntent.client_secret,
            bonusPointsEarned: bonusPoints
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при покупке билетов', error: error.message });
    }
});

// Подтверждение оплаты билета
router.post('/:id/tickets/:ticketId/confirm', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: {
                id: req.params.ticketId,
                userId: req.user.id
            }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Билет не найден' });
        }

        // Подтверждение платежа в Stripe
        await stripe.confirmPayment(ticket.paymentId);

        // Обновление статуса билета
        await ticket.update({
            status: 'paid'
        });

        // Генерация QR-кода для билета
        const qrCode = await generateQRCode(ticket.id);
        await ticket.update({ qrCode });

        res.json({
            message: 'Оплата подтверждена',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при подтверждении оплаты', error: error.message });
    }
});

// Отмена билета
router.post('/:id/tickets/:ticketId/cancel', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: {
                id: req.params.ticketId,
                userId: req.user.id,
                status: 'paid'
            }
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Билет не найден' });
        }

        // Возврат средств через Stripe
        await stripe.createRefund(ticket.paymentId);

        // Обновление статуса билета
        await ticket.update({
            status: 'cancelled'
        });

        // Возврат билетов в доступные
        const event = await Event.findByPk(ticket.eventId);
        await event.update({
            availableTickets: event.availableTickets + ticket.quantity
        });

        // Возврат бонусных баллов
        await req.user.update({
            bonusPoints: req.user.bonusPoints - ticket.bonusPointsEarned
        });

        res.json({
            message: 'Билет успешно отменен',
            ticket
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при отмене билета', error: error.message });
    }
});

module.exports = router; 