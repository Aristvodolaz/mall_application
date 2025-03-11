const path = require('path');
const fs = require('fs');
const { getScreeningDateTime } = require('../../utils/dateTime');
const { avatarUploader } = require('../../middleware/upload');
const express = require('express');
const router = express.Router();
const { User, CinemaTicket, Screening, Movie, MovieReview } = require('../../models');
const { Op } = require('sequelize');
const auth = require('../../middleware/auth');

// Страница профиля
router.get('/profile', auth, async (req, res) => {
    try {
        // Получаем билеты пользователя
        const tickets = await CinemaTicket.findAll({
            where: {
                user_id: req.user.id,
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
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

        // Получаем отзывы пользователя
        const reviews = await MovieReview.findAll({
            where: {
                user_id: req.user.id
            },
            include: [{
                model: Movie,
                as: 'movie'
            }],
            order: [['created_at', 'DESC']]
        });

        res.render('pages/profile', {
            title: 'Мой профиль - ТРЦ \'Кристалл\'',
            user: req.user,
            tickets,
            reviews
        });
    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке профиля',
            error,
            user: req.user
        });
    }
});

// Обновление профиля
router.post('/profile', auth, async (req, res) => {
    try {
        const { username, email } = req.body;

        // Проверяем, не занят ли email другим пользователем
        const existingUser = await User.findOne({
            where: {
                email,
                id: { [Op.ne]: req.user.id }
            }
        });

        if (existingUser) {
            return res.render('pages/profile', {
                title: 'Мой профиль - ТРЦ \'Кристалл\'',
                user: req.user,
                error: 'Этот email уже используется другим пользователем'
            });
        }

        // Обновляем данные пользователя
        await User.update(
            { username, email },
            { where: { id: req.user.id } }
        );

        // Обновляем данные в сессии
        req.user.username = username;
        req.user.email = email;

        res.redirect('/profile');
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.render('pages/profile', {
            title: 'Мой профиль - ТРЦ \'Кристалл\'',
            user: req.user,
            error: 'Произошла ошибка при обновлении профиля'
        });
    }
});

// Загрузка аватара
router.post('/profile/avatar', auth, avatarUploader.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Файл не был загружен'
            });
        }

        // Получаем старый аватар
        const user = await User.findByPk(req.user.id);
        const oldAvatar = user.avatar_url;

        // Если есть старый аватар, удаляем его
        if (oldAvatar) {
            const oldAvatarPath = path.join(__dirname, '../../../public', oldAvatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Обновляем путь к аватару в базе данных
        const avatarUrl = '/uploads/avatars/' + req.file.filename;
        await User.update({
            avatar_url: avatarUrl
        }, {
            where: {
                id: req.user.id
            }
        });

        return res.json({
            success: true,
            message: 'Аватар успешно обновлен',
            avatar_url: avatarUrl
        });

    } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            success: false,
            message: 'Произошла ошибка при загрузке аватара'
        });
    }
}); 