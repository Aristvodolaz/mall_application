/**
 * Система уведомлений для сайта ТЦ
 * Обрабатывает отображение всплывающих уведомлений, оповещений и сообщений
 */

document.addEventListener('DOMContentLoaded', function() {
    // Контейнер для уведомлений
    let notificationContainer = document.getElementById('notification-container');
    
    // Если контейнер не существует, создаем его
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    /**
     * Показывает уведомление
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (success, error, warning, info)
     * @param {number} duration - Длительность показа в миллисекундах
     */
    window.showNotification = function(message, type = 'info', duration = 5000) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Добавляем иконку в зависимости от типа
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="bi bi-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="bi bi-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="bi bi-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="bi bi-info-circle"></i>';
        }
        
        // Создаем содержимое уведомления
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">${message}</div>
            <button class="notification-close"><i class="bi bi-x"></i></button>
        `;
        
        // Добавляем уведомление в контейнер
        notificationContainer.appendChild(notification);
        
        // Добавляем класс для анимации появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Настраиваем закрытие по клику на кнопку
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            closeNotification(notification);
        });
        
        // Автоматическое закрытие через указанное время
        if (duration > 0) {
            setTimeout(() => {
                closeNotification(notification);
            }, duration);
        }
    };
    
    /**
     * Закрывает уведомление с анимацией
     * @param {HTMLElement} notification - Элемент уведомления
     */
    function closeNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Удаляем элемент после завершения анимации
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Глобальная обработка ошибок AJAX
    document.addEventListener('ajaxError', function(event) {
        const error = event.detail;
        showNotification(error.message || 'Произошла ошибка при выполнении запроса', 'error');
    });
    
    // Глобальная обработка успешных действий
    document.addEventListener('ajaxSuccess', function(event) {
        const data = event.detail;
        if (data.message) {
            showNotification(data.message, 'success');
        }
    });
}); 