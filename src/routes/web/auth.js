const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../../models');

// Страница входа
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/auth/login', {
        title: 'Вход - ТРЦ \'Кристалл\'',
        user: null
    });
});

// Обработка входа
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.render('pages/auth/login', {
                title: 'Вход - ТРЦ \'Кристалл\'',
                error: 'Неверный email или пароль',
                user: null
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('pages/auth/login', {
                title: 'Вход - ТРЦ \'Кристалл\'',
                error: 'Неверный email или пароль',
                user: null
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url
        };

        res.redirect('/');
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.render('pages/auth/login', {
            title: 'Вход - ТРЦ \'Кристалл\'',
            error: 'Произошла ошибка при входе',
            user: null
        });
    }
});

// Страница регистрации
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('pages/auth/register', {
        title: 'Регистрация - ТРЦ \'Кристалл\'',
        user: null
    });
});

// Обработка регистрации
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;

        // Проверяем, совпадают ли пароли
        if (password !== confirm_password) {
            return res.render('pages/auth/register', {
                title: 'Регистрация - ТРЦ \'Кристалл\'',
                error: 'Пароли не совпадают',
                user: null
            });
        }

        // Проверяем, не занят ли email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.render('pages/auth/register', {
                title: 'Регистрация - ТРЦ \'Кристалл\'',
                error: 'Этот email уже зарегистрирован',
                user: null
            });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем нового пользователя
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            created_at: new Date()
        });

        // Авторизуем пользователя
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url
        };

        res.redirect('/');
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.render('pages/auth/register', {
            title: 'Регистрация - ТРЦ \'Кристалл\'',
            error: 'Произошла ошибка при регистрации',
            user: null
        });
    }
});

// Выход
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router; 