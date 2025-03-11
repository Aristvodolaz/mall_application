const express = require('express');
const router = express.Router();
const { Movie, Screening, CinemaTicket } = require('../../models');
const { Op } = require('sequelize');
const auth = require('../../middleware/auth');
const { isScreeningPassed } = require('../../utils/dateTime');

// Главная страница кинотеатра - список фильмов
router.get('/', async (req, res) => {
    try {
        console.log('Получен запрос на страницу кинотеатра');
        const user = req.session.user || null;
        
        const where = {
            is_active: true,
            [Op.or]: [
                { end_date: { [Op.gte]: new Date() } },
                { end_date: null }
            ]
        };
        
        console.log('Загрузка активных фильмов...');
        const movies = await Movie.findAll({
            where,
            order: [['release_date', 'DESC']]
        });
        
        console.log(`Найдено ${movies.length} активных фильмов`);
        
        const moviesData = movies.map(movie => ({
            ...movie.toJSON(),
            averageRating: 0,
            reviewsCount: 0
        }));
        
        res.render('pages/cinema', {
            title: 'Кинотеатр - ТРЦ \'Кристалл\'',
            movies: moviesData,
            user
        });
        console.log('Страница кинотеатра успешно отрендерена');
    } catch (error) {
        console.error('Ошибка при получении списка фильмов:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке списка фильмов',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница деталей фильма
router.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        console.log('Загрузка фильма с ID:', movieId);
        
        const user = req.session.user || null;
        
        console.log('Загрузка информации о фильме...');
        const movie = await Movie.findByPk(movieId);
        
        console.log('Найден фильм:', movie ? movie.title : 'не найден');
        
        if (!movie) {
            console.log('Фильм не найден:', movieId);
            return res.status(404).render('pages/error', {
                title: 'Фильм не найден - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемый фильм не найден',
                user
            });
        }
        
        console.log('Загрузка предстоящих сеансов...');
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        console.log('Текущая дата для поиска:', currentDate);
        
        const screenings = await Screening.findAll({
            where: {
                movie_id: movieId,
                date: {
                    [Op.gte]: currentDate
                },
                is_active: true
            },
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });
        
        console.log('Найдено сеансов:', screenings.length);
        console.log('Первый сеанс:', screenings[0] ? {
            date: screenings[0].date,
            time: screenings[0].time,
            hall: screenings[0].hall
        } : 'нет сеансов');
        
        const screeningsByDate = {};
        
        if (screenings && screenings.length > 0) {
            screenings.forEach(screening => {
                const screeningData = screening.toJSON();
                const date = new Date(screeningData.date).toLocaleDateString('ru-RU');
                
                console.log('Обработка сеанса:', {
                    id: screeningData.id,
                    date: screeningData.date,
                    formattedDate: date,
                    time: screeningData.time
                });
                
                if (!screeningsByDate[date]) {
                    screeningsByDate[date] = [];
                }
                
                // Форматируем время
                const timeStr = screeningData.time;
                const [hours, minutes] = timeStr.split(':');
                const time = new Date();
                time.setHours(hours);
                time.setMinutes(minutes);
                
                screeningsByDate[date].push({
                    ...screeningData,
                    formattedTime: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                    formattedDate: date
                });
            });
        }
        
        console.log('Сгруппированные сеансы:', JSON.stringify(screeningsByDate, null, 2));
        
        console.log('Рендеринг страницы фильма...');
        res.render('pages/cinema/movie-details', {
            title: `${movie.title} - ТРЦ 'Кристалл'`,
            movie: {
                ...movie.toJSON(),
                rating: 0,
                reviewsCount: 0
            },
            screeningsByDate,
            user
        });
        console.log('Страница фильма успешно отрендерена');
    } catch (error) {
        console.error('Ошибка при получении деталей фильма:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке деталей фильма',
            error: process.env.NODE_ENV === 'development' ? error : {},
            user: req.session.user || null
        });
    }
});

// Страница выбора мест
router.get('/screening/:id', async (req, res) => {
    try {
        const screeningId = req.params.id;
        console.log('Получен запрос на страницу выбора мест для сеанса:', screeningId);
        
        const user = req.session.user || null;
        
        console.log('Загрузка информации о сеансе...');
        const screening = await Screening.findByPk(screeningId, {
            include: [
                {
                    model: Movie,
                    as: 'movie'
                }
            ]
        });
        
        if (!screening) {
            console.log('Сеанс не найден:', screeningId);
            return res.status(404).render('pages/error', {
                title: 'Сеанс не найден - ТРЦ \'Кристалл\'',
                message: 'Запрашиваемый сеанс не найден',
                user
            });
        }
        
        console.log('Загрузка информации о занятых местах...');
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

        const screeningData = screening.toJSON();
        // Парсим схему зала из JSON
        try {
            screeningData.seats_layout = JSON.parse(screeningData.seats_layout);
            console.log('Схема зала успешно распарсена:', screeningData.seats_layout);
        } catch (error) {
            console.error('Ошибка при парсинге схемы зала:', error);
            screeningData.seats_layout = null;
        }

        console.log('Схема зала:', screeningData.seats_layout);
        console.log('Занятые места:', occupiedSeats);
        
        res.render('pages/cinema/seat-selection', {
            title: `Выбор мест - ${screening.movie.title}`,
            movie: screening.movie,
            screening: {
                ...screeningData,
                occupiedSeats
            },
            user
        });
    } catch (error) {
        console.error('Ошибка при загрузке страницы выбора мест:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка - ТРЦ \'Кристалл\'',
            message: 'Произошла ошибка при загрузке страницы выбора мест',
            error: process.env.NODE_ENV === 'development' ? error : {},
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