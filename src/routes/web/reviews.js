const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Review, Shop, User } = require('../../models');
const auth = require('../../middleware/auth');

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/reviews';
        // Создаем директорию, если она не существует
        fs.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // максимум 5 файлов
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG и GIF'));
        }
    }
});

// Создание нового отзыва
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const { shop_id, rating, comment } = req.body;

        // Проверяем, существует ли магазин
        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            // Удаляем загруженные файлы, если магазин не найден
            if (req.files) {
                await Promise.all(req.files.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Ошибка при удалении файла:', err))
                ));
            }
            return res.status(404).render('pages/error', {
                title: 'Ошибка - ТРЦ \'Кристалл\'',
                message: 'Магазин не найден',
                user: req.session.user
            });
        }

        // Проверяем, не оставлял ли пользователь уже отзыв
        const existingReview = await Review.findOne({
            where: {
                user_id: req.session.user.id,
                shop_id
            }
        });

        if (existingReview) {
            // Удаляем загруженные файлы, если отзыв уже существует
            if (req.files) {
                await Promise.all(req.files.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Ошибка при удалении файла:', err))
                ));
            }
            return res.status(400).render('pages/error', {
                title: 'Ошибка - ТРЦ \'Кристалл\'',
                message: 'Вы уже оставляли отзыв для этого магазина',
                user: req.session.user
            });
        }

        // Создаем массив путей к изображениям
        const images = req.files ? req.files.map(file => '/uploads/reviews/' + file.filename) : [];

        // Создаем отзыв
        await Review.create({
            user_id: req.session.user.id,
            shop_id,
            rating: parseInt(rating),
            comment,
            images
        });

        // Обновляем рейтинг магазина
        const reviews = await Review.findAll({
            where: { shop_id }
        });

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        await shop.update({
            rating: parseFloat(averageRating.toFixed(2)),
            reviews_count: reviews.length
        });

        // Перенаправляем обратно на страницу магазина
        res.redirect(`/shops/${shop_id}`);
    } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
        
        // Удаляем загруженные файлы в случае ошибки
        if (req.files) {
            await Promise.all(req.files.map(file => 
                fs.unlink(file.path).catch(err => console.error('Ошибка при удалении файла:', err))
            ));
        }

        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при создании отзыва',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user
        });
    }
});

module.exports = router; 