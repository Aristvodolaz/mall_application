/**
 * Middleware для проверки аутентификации пользователя
 */
module.exports = (req, res, next) => {
    // Проверяем, авторизован ли пользователь
    if (!req.session.user) {
        // Сохраняем URL, на который пытался перейти пользователь
        req.session.returnTo = req.originalUrl;
        // Перенаправляем на страницу входа
        return res.redirect('/login');
    }
    next();
}; 