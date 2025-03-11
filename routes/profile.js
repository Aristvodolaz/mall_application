const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const path = require('path');
const { Op } = require('sequelize');

// Middleware для проверки аутентификации
const auth = passport.authenticate('jwt', { session: false });

// Получение профиля пользователя
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'name', 'avatar', 'bonusPoints', 'createdAt']
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении профиля', error: error.message });
    }
});

// Обновление профиля
router.put('/', auth, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // Проверка пароля при его изменении
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Необходимо указать текущий пароль' });
            }

            const isMatch = await user.validatePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный текущий пароль' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }

        // Обновление остальных данных
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                bonusPoints: user.bonusPoints
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении профиля', error: error.message });
    }
});

// Получение истории билетов
router.get('/tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Event,
                attributes: ['title', 'date', 'location']
            }],
            order: [['purchaseDate', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении истории билетов', error: error.message });
    }
});

// Получение бонусных баллов
router.get('/bonuses', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['bonusPoints']
        });
        
        // Получение истории начисления бонусов
        const bonusHistory = await Ticket.findAll({
            where: { 
                userId: req.user.id,
                status: 'paid',
                bonusPointsEarned: {
                    [Op.gt]: 0
                }
            },
            attributes: ['bonusPointsEarned', 'purchaseDate'],
            order: [['purchaseDate', 'DESC']],
            limit: 10
        });

        res.json({
            currentPoints: user.bonusPoints,
            history: bonusHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении информации о бонусах', error: error.message });
    }
});

// Загрузка аватара
router.post('/avatar', auth, async (req, res) => {
    try {
        if (!req.files || !req.files.avatar) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        const avatar = req.files.avatar;
        const fileName = `${req.user.id}_${Date.now()}${path.extname(avatar.name)}`;
        
        // Сохранение файла
        await avatar.mv(path.join(__dirname, '../public/uploads/avatars', fileName));

        // Обновление пути к аватару в БД
        await req.user.update({
            avatar: `/uploads/avatars/${fileName}`
        });

        res.json({
            message: 'Аватар успешно обновлен',
            avatar: `/uploads/avatars/${fileName}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке аватара', error: error.message });
    }
});

module.exports = router; 