const express = require('express');
const router = express.Router();
const { Movie, Screening, CinemaTicket, MovieReview, User } = require('../../models');
const { Op } = require('sequelize');
const auth = require('../../middleware/auth');
const { isScreeningPassed } = require('../../utils/dateTime');

// Главная страница кинотеатра - список фильмов
router.get('/', async (req, res) => {
    try {
        // Получаем текущего пользователя из сессии
        const user = req.session.user || null;
        
        // Фильтр для активных фильмов
        const where = {
            is_active: true,
            [Op.or]: [
                { end_date: { [Op.gte]: new Date() } },
                { end_date: null }
            ]
        };
        
        // Получаем все активные фильмы с их отзывами
        const movies = await Movie.findAll({
            where,
            include: [
                {
                    model: MovieReview,
                    as: 'reviews',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'avatar_url']
                        }
                    ]
                }
            ],
            order: [['release_date', 'DESC']]
        });
        
        // Рассчитываем средний рейтинг для каждого фильма
        const moviesWithRatings = movies.map(movie => {
            const movieData = movie.toJSON();
            const reviews = movieData.reviews || [];
            
            // Рассчитываем средний рейтинг
            const averageRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : null;
            
            // Добавляем средний рейтинг и количество отзывов
            return {
                ...movieData,
                averageRating,
                reviewsCount: reviews.length
            };
        });
        
        res.render('pages/cinema', {
            title: 'Кинотеатр - ТРЦ \'Кристалл\'',
            movies: moviesWithRatings,
            user
        });
    } catch (error) {
        console.error('Ошибка при получении списка фильмов:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка фильмов',
            error,
            user: req.session.user || null
        });
    }
});

// Страница деталей фильма
router.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const user = req.session.user || null;
        
        // Получаем фильм с отзывами
        const movie = await Movie.findByPk(movieId, {
            include: [
                {
                    model: MovieReview,
                    as: 'reviews',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'avatar_url']
                        }
                    ]
                }
            ]
        });
        
        if (!movie) {
            return res.render('pages/error', {
                title: 'Фильм не найден - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемый фильм не найден',
                user
            });
        }
        
        // Рассчитываем средний рейтинг
        const reviews = movie.reviews || [];
        const rating = reviews.length > 0 
            ? parseFloat((reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1))
            : 0;
        const reviewsCount = reviews.length;
        
        // Получаем предстоящие сеансы для фильма
        const screenings = await Screening.findAll({
            where: {
                movie_id: movieId,
                date: {
                    [Op.gte]: new Date()
                }
            },
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });
        
        // Группируем сеансы по датам
        const screeningsByDate = {};
        
        if (screenings && screenings.length > 0) {
            screenings.forEach(screening => {
                const screeningData = screening.toJSON();
                const date = new Date(screeningData.date).toLocaleDateString('ru-RU');
                
                if (!screeningsByDate[date]) {
                    screeningsByDate[date] = [];
                }
                
                screeningsByDate[date].push(screeningData);
            });
        }
        
        res.render('pages/movie-details', {
            title: `${movie.title} - ТРЦ 'Кристалл'`,
            movie: {
                ...movie.toJSON(),
                rating,
                reviewsCount
            },
            screeningsByDate,
            user
        });
    } catch (error) {
        console.error('Ошибка при получении деталей фильма:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей фильма',
            error,
            user: req.session.user || null
        });
    }
});

// Страница выбора мест
router.get('/screening/:id', async (req, res) => {
    try {
        const screeningId = req.params.id;
        const user = req.session.user || null;
        
        // Получаем сеанс с информацией о фильме
        const screening = await Screening.findByPk(screeningId, {
            include: [
                {
                    model: Movie,
                    as: 'movie'
                }
            ]
        });
        
        if (!screening) {
            return res.render('pages/error', {
                title: 'Сеанс не найден - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемый сеанс не найден',
                user
            });
        }
        
        // Получаем занятые места для этого сеанса
        const occupiedTickets = await CinemaTicket.findAll({
            where: {
                screening_id: screeningId,
                status: {
                    [Op.ne]: 'cancelled'
                }
            },
            attributes: ['row', 'seat']
        });
        
        const occupiedSeats = occupiedTickets.map(ticket => ({
            row: ticket.row,
            seat: ticket.seat
        }));
        
        res.render('pages/seat-selection', {
            title: `Выбор мест - ${screening.movie.title} - ТРЦ 'Кристалл'`,
            screening,
            occupiedSeats,
            user
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы выбора мест:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке страницы выбора мест',
            error,
            user: req.session.user || null
        });
    }
});

// Страница деталей бронирования
router.get('/booking/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const user = req.session.user;
        
        // Проверяем, авторизован ли пользователь
        if (!user) {
            return res.redirect('/login?redirect=/bookings/' + bookingId);
        }
        
        // Получаем бронирование с билетами и информацией о сеансе и фильме
        const booking = await CinemaTicket.findOne({
            where: {
                id: bookingId,
                user_id: user.id
            },
            include: [
                {
                    model: Screening,
                    as: 'screening',
                    include: [
                        {
                            model: Movie,
                            as: 'movie'
                        }
                    ]
                }
            ]
        });
        
        if (!booking) {
            return res.render('pages/error', {
                title: 'Бронирование не найдено - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемое бронирование не найдено или у вас нет доступа к нему',
                user
            });
        }
        
        // Получаем все билеты для этого бронирования
        const tickets = await CinemaTicket.findAll({
            where: {
                booking_id: booking.booking_id,
                user_id: user.id
            }
        });
        
        // Рассчитываем общую стоимость
        const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
        
        // Формируем объект бронирования с билетами
        const bookingData = {
            id: booking.booking_id,
            created_at: booking.created_at,
            status: booking.status,
            payment_method: booking.payment_method,
            confirmation_code: booking.confirmation_code,
            screening: booking.screening,
            tickets,
            total_price: totalPrice
        };
        
        res.render('pages/booking-details', {
            title: `Бронирование #${booking.booking_id} - ТРЦ 'Кристалл'`,
            booking: bookingData,
            user
        });
    } catch (error) {
        console.error('Ошибка при загрузке деталей бронирования:', error);
        res.render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей бронирования',
            error,
            user: req.session.user || null
        });
    }
});

// API маршруты
router.post('/review', auth, async (req, res) => {
    try {
        const { movie_id, rating, content } = req.body;
        
        // Проверяем обязательные поля
        if (!movie_id || !rating || !content) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }
        
        // Проверяем, существует ли фильм
        const movie = await Movie.findByPk(movie_id);
        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }
        
        // Проверяем, не оставлял ли пользователь уже отзыв на этот фильм
        const existingReview = await MovieReview.findOne({
            where: {
                movie_id,
                user_id: req.user.id
            }
        });
        
        if (existingReview) {
            return res.status(400).json({ message: 'Вы уже оставили отзыв на этот фильм' });
        }
        
        // Создаем новый отзыв
        const review = await MovieReview.create({
            movie_id,
            user_id: req.user.id,
            rating: parseInt(rating),
            content,
            created_at: new Date()
        });
        
        res.status(201).json({
            message: 'Отзыв успешно добавлен',
            review
        });
    } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error);
        res.status(500).json({ message: 'Произошла ошибка при добавлении отзыва' });
    }
});

// API для создания бронирования
router.post('/booking', auth, async (req, res) => {
    try {
        const { screening_id, selected_seats, payment_method } = req.body;
        
        // Проверяем обязательные поля
        if (!screening_id || !selected_seats || !selected_seats.length || !payment_method) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }
        
        // Проверяем, существует ли сеанс
        const screening = await Screening.findByPk(screening_id);
        if (!screening) {
            return res.status(404).json({ message: 'Сеанс не найден' });
        }
        
        // Проверяем, не заняты ли выбранные места
        const occupiedSeats = await CinemaTicket.findAll({
            where: {
                screening_id,
                status: {
                    [Op.ne]: 'cancelled'
                },
                [Op.or]: selected_seats.map(seat => ({
                    row: seat.row,
                    seat: seat.seat
                }))
            }
        });
        
        if (occupiedSeats.length > 0) {
            return res.status(400).json({ message: 'Некоторые из выбранных мест уже заняты' });
        }
        
        // Генерируем уникальный ID бронирования
        const bookingId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        
        // Генерируем код подтверждения
        const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Создаем билеты для каждого выбранного места
        const tickets = await Promise.all(selected_seats.map(seat => {
            return CinemaTicket.create({
                booking_id: bookingId,
                screening_id,
                user_id: req.user.id,
                row: seat.row,
                seat: seat.seat,
                price: seat.price,
                is_vip: seat.price > screening.base_price,
                status: payment_method === 'card' ? 'confirmed' : 'pending',
                payment_method,
                confirmation_code: confirmationCode,
                created_at: new Date()
            });
        }));
        
        res.status(201).json({
            message: 'Бронирование успешно создано',
            booking_id: bookingId,
            confirmation_code: confirmationCode
        });
    } catch (error) {
        console.error('Ошибка при создании бронирования:', error);
        res.status(500).json({ message: 'Произошла ошибка при создании бронирования' });
    }
});

// API для отмены бронирования
router.post('/booking/:id/cancel', auth, async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Получаем билеты для этого бронирования
        const tickets = await CinemaTicket.findAll({
            where: {
                booking_id: bookingId,
                user_id: req.user.id
            },
            include: [
                {
                    model: Screening,
                    as: 'screening'
                }
            ]
        });
        
        if (tickets.length === 0) {
            return res.status(404).json({ message: 'Бронирование не найдено или у вас нет доступа к нему' });
        }
        
        // Проверяем, можно ли отменить бронирование (не менее чем за 2 часа до сеанса)
        const screening = tickets[0].screening;
        const screeningDateTime = new Date(screening.date);
        const [hours, minutes] = screening.time.split(':').map(Number);
        screeningDateTime.setHours(hours, minutes);
        
        const now = new Date();
        const timeDiff = screeningDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 2) {
            return res.status(400).json({ message: 'Бронирование можно отменить не позднее чем за 2 часа до начала сеанса' });
        }
        
        // Отменяем все билеты для этого бронирования
        await Promise.all(tickets.map(ticket => {
            return ticket.update({ status: 'cancelled' });
        }));
        
        res.json({ message: 'Бронирование успешно отменено' });
    } catch (error) {
        console.error('Ошибка при отмене бронирования:', error);
        res.status(500).json({ message: 'Произошла ошибка при отмене бронирования' });
    }
});

module.exports = router; 