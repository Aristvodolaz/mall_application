const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Проверяем, является ли запрос AJAX-запросом
    const isApiRequest = req.xhr || req.path.startsWith('/api');

    if (isApiRequest) {
        // Для API-запросов возвращаем JSON
        return res.status(err.status || 500).json({
            error: err.message || 'Внутренняя ошибка сервера'
        });
    }

    // Для обычных запросов рендерим страницу ошибки
    if (err.status === 404) {
        return res.status(404).render('pages/errors/404', {
            title: 'Страница не найдена',
            user: req.user
        });
    }

    res.status(err.status || 500).render('pages/errors/500', {
        title: 'Ошибка сервера',
        user: req.user,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

// Middleware для обработки 404 ошибок
const notFoundHandler = (req, res, next) => {
    const err = new Error('Страница не найдена');
    err.status = 404;
    next(err);
};

module.exports = {
    errorHandler,
    notFoundHandler
}; 