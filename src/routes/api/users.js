const express = require('express');
const router = express.Router();
const { User, CinemaTicket, MovieReview } = require('../../models');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Получение профиля пользователя
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ error: 'Ошибка при получении профиля' });
    }
});

// Обновление профиля
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;

        // Проверяем, не занят ли email другим пользователем
        const existingUser = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: req.session.user.id }
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Этот email уже используется другим пользователем' });
        }

        // Обновляем данные пользователя
        await User.update(
            { username, email },
            { where: { id: req.session.user.id } }
        );

        // Получаем обновленные данные
        const updatedUser = await User.findByPk(req.session.user.id, {
            attributes: { exclude: ['password'] }
        });

        // Обновляем данные в сессии
        req.session.user = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar_url: updatedUser.avatar_url
        };

        res.json(updatedUser);
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
});

// Изменение пароля
router.put('/password', auth, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        // Получаем пользователя с паролем
        const user = await User.findByPk(req.session.user.id);

        // Проверяем текущий пароль
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Обновляем пароль
        await User.update(
            { password: hashedPassword },
            { where: { id: req.session.user.id } }
        );

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ error: 'Ошибка при изменении пароля' });
    }
});

// Получение билетов пользователя
router.get('/tickets', auth, async (req, res) => {
    try {
        const tickets = await CinemaTicket.findAll({
            where: { user_id: req.session.user.id },
            include: [{
                model: Screening,
                as: 'screening',
                include: [{
                    model: Movie,
                    as: 'movie'
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(tickets);
    } catch (error) {
        console.error('Ошибка при получении билетов:', error);
        res.status(500).json({ error: 'Ошибка при получении билетов' });
    }
});

// Получение отзывов пользователя
router.get('/reviews', auth, async (req, res) => {
    try {
        const reviews = await MovieReview.findAll({
            where: { user_id: req.session.user.id },
            include: [{
                model: Movie,
                as: 'movie'
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({ error: 'Ошибка при получении отзывов' });
    }
});

module.exports = router; 