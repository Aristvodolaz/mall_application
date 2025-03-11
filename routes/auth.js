const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Проверка существования пользователя
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создание нового пользователя
        const user = await User.create({
            email,
            password,
            name
        });

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при регистрации', error: error.message });
    }
});

// Вход
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при входе', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info.message });
        }

        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка при входе', error: err.message });
            }

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: 'Вход выполнен успешно',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        });
    })(req, res, next);
});

// Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Редирект на фронтенд с токеном
        res.redirect(`/auth/success?token=${token}`);
    }
);

// Выход
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Выход выполнен успешно' });
});

// Проверка текущего пользователя
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            avatar: req.user.avatar,
            bonusPoints: req.user.bonusPoints
        }
    });
});

module.exports = router; 