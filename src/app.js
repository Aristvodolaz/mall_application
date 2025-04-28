require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const socketio = require('socket.io');
const { createServer } = require('http');
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment');
const session = require('express-session');
const flash = require('connect-flash');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { sequelize } = require('./models');
const passport = require('passport');
const morgan = require('morgan');
const compression = require('compression');

moment.locale('ru');

// Инициализация приложения
const app = express();
const server = createServer(app);
const io = socketio(server);

// Настройка шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Настройка безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "wss:", "ws:", "https:", "http:"]
        }
    }
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

// Ограничение запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // максимум 100 запросов с одного IP
});
app.use('/api', limiter);

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Подключение конфигурации Passport
require('./config/passport')(passport);

// Flash-сообщения
app.use(flash());

// Глобальные переменные
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.currentPath = req.path;
    res.locals.path = req.path;
    res.locals.moment = moment;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Регистрация маршрутов
const webRoutes = {
    index: { path: './routes/web/index', prefix: '/' },
    cinema: { path: './routes/web/cinema', prefix: '/cinema' },
    auth: { path: './routes/web/auth', prefix: '/auth' },
    profile: { path: './routes/web/profile', prefix: '/profile' },
    shops: { path: './routes/web/shops', prefix: '/shops' },
    promotions: { path: './routes/web/promotions', prefix: '/promotions' },
    events: { path: './routes/web/events', prefix: '/events' },
    admin: { path: './routes/web/admin', prefix: '/admin' },
    reviews: { path: './routes/web/reviews', prefix: '/reviews' }
};

// Подключаем веб-маршруты
Object.entries(webRoutes).forEach(([name, { path, prefix }]) => {
    try {
        console.log(`Loading route ${name} from ${path}...`);
        const route = require(path);
        if (route && typeof route === 'function') {
            app.use(prefix, route);
            console.log(`Web route ${name} loaded successfully at ${prefix}`);
        } else {
            console.error(`Web route ${name} is not a function:`, typeof route);
        }
    } catch (error) {
        console.error(`Error loading web route ${name}:`, error);
    }
});

// Подключаем административные маршруты
const adminRoutes = require('./routes/web/admin');
app.use('/admin', adminRoutes);
console.log('Admin routes loaded successfully at /admin');

// API маршруты
try {
    console.log('Loading API routes...');
    const apiRoutes = require('./routes/api/index');
    
    if (!apiRoutes) {
        throw new Error('API routes module is undefined');
    }
    
    if (typeof apiRoutes !== 'function') {
        console.log('API routes type:', typeof apiRoutes);
        console.log('API routes content:', apiRoutes);
        throw new Error('API routes is not a function');
    }
    
    app.use('/api', apiRoutes);
    console.log('API routes loaded successfully');
} catch (error) {
    console.error('Failed to load API routes:', error);
}

// Обработка 404 ошибок
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
const PORT = process.env.PORT || 3003;

// Подключение к базе данных и запуск сервера
sequelize.authenticate()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Порт ${PORT} уже используется. Попробуйте другой порт.`);
                process.exit(1);
            } else {
                console.error('Ошибка запуска сервера:', err);
                process.exit(1);
            }
        });
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1);
    });

// Обработка Socket.IO подключений
io.on('connection', (socket) => {
    console.log('Новое подключение к Socket.IO');

    socket.on('join-chat', (userId) => {
        socket.join(`user-${userId}`);
    });

    socket.on('chat-message', async (data) => {
        try {
            io.to(`user-${data.recipientId}`).emit('new-message', {
                senderId: data.senderId,
                message: data.message,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился от Socket.IO');
    });
});

module.exports = app; 