/**
 * Преобразует дату и время сеанса в объект Date
 * @param {Date} date - Дата сеанса
 * @param {string} time - Время сеанса в формате HH:mm
 * @returns {Date} Объект Date с установленными датой и временем
 */
function getScreeningDateTime(date, time) {
    const screeningDateTime = new Date(date);
    screeningDateTime.setHours(
        parseInt(time.split(':')[0]),
        parseInt(time.split(':')[1])
    );
    return screeningDateTime;
}

/**
 * Проверяет, прошел ли сеанс
 * @param {Date} date - Дата сеанса
 * @param {string} time - Время сеанса в формате HH:mm
 * @returns {boolean} true если сеанс прошел, false если нет
 */
function isScreeningPassed(date, time) {
    const screeningDateTime = getScreeningDateTime(date, time);
    return screeningDateTime < new Date();
}

module.exports = {
    getScreeningDateTime,
    isScreeningPassed
}; 