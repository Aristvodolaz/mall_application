// Инициализация Socket.IO
const socket = io();

// Слайдер на главной странице
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  
  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval;
    
    // Функция для переключения слайдов
    function goToSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }
    
    // Автоматическое переключение слайдов
    function startSlideInterval() {
      slideInterval = setInterval(() => {
        let nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
      }, 5000);
    }
    
    // Обработчики событий
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
        startSlideInterval();
      });
      
      nextBtn.addEventListener('click', () => {
        clearInterval(slideInterval);
        let nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
        startSlideInterval();
      });
    }
    
    if (dots.length > 0) {
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          clearInterval(slideInterval);
          goToSlide(index);
          startSlideInterval();
        });
      });
    }
    
    // Запуск автоматического переключения
    startSlideInterval();
  }
});

// Обработка чата
if (document.getElementById('chatForm')) {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const unreadMessages = document.getElementById('unreadMessages');

    // Присоединение к чату
    socket.emit('auth', USER_ID); // USER_ID должен быть определен на странице

    // Отправка сообщения
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('sendMessage', {
                message,
                senderId: USER_ID,
                recipientId: 'admin' // ID администратора
            });
            addMessage(message, 'sent');
            messageInput.value = '';
        }
    });

    // Получение сообщения
    socket.on('newMessage', (data) => {
        addMessage(data.message, 'received');
        if (!document.getElementById('chatOffcanvas').classList.contains('show')) {
            incrementUnreadMessages();
        }
    });

    // Добавление сообщения в чат
    function addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type} animate-fade-in`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Увеличение счетчика непрочитанных сообщений
    function incrementUnreadMessages() {
        let count = parseInt(unreadMessages.textContent) || 0;
        unreadMessages.textContent = count + 1;
        unreadMessages.style.display = 'block';
    }

    // Сброс счетчика при открытии чата
    document.getElementById('chatOffcanvas').addEventListener('show.bs.offcanvas', () => {
        unreadMessages.textContent = '0';
        unreadMessages.style.display = 'none';
    });
}

// Push-уведомления
if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            subscribeToNotifications();
        }
    });
}

function subscribeToNotifications() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) // PUBLIC_VAPID_KEY должен быть определен
        }).then(function(subscription) {
            // Отправка подписки на сервер
            fetch('/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });
        });
    });
}

// Обработка уведомлений через Socket.IO
socket.on('notification', (notification) => {
    showNotification(notification);
});

function showNotification(notification) {
    const toast = document.getElementById('notificationToast');
    const toastBody = document.getElementById('notificationBody');
    toastBody.textContent = notification.message;
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Stripe интеграция
if (document.getElementById('paymentForm')) {
    const stripe = Stripe(STRIPE_PUBLIC_KEY); // STRIPE_PUBLIC_KEY должен быть определен
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = paymentForm.querySelector('button');
        button.disabled = true;

        try {
            const { paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card
            });

            const response = await fetch('/events/' + EVENT_ID + '/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    quantity: document.getElementById('ticketQuantity').value
                })
            });

            const result = await response.json();

            if (result.clientSecret) {
                const { error } = await stripe.confirmCardPayment(result.clientSecret);
                if (error) {
                    throw new Error(error.message);
                }
                window.location.href = '/profile/tickets';
            }
        } catch (error) {
            showError(error.message);
            button.disabled = false;
        }
    });
}

// Интерактивная карта
if (document.getElementById('mall-map')) {
    const map = L.map('mall-map').setView([51.505, -0.09], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Загрузка магазинов для текущего этажа
    async function loadShopsForFloor(floor) {
        const response = await fetch(`/shops?floor=${floor}`);
        const shops = await response.json();

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        shops.forEach(shop => {
            const marker = L.marker([shop.latitude, shop.longitude])
                .addTo(map)
                .bindPopup(`
                    <h5>${shop.name}</h5>
                    <p>${shop.category}</p>
                    <a href="/shops/${shop.id}" class="btn btn-sm btn-primary">Подробнее</a>
                `);
        });
    }

    // Переключение этажей
    document.querySelectorAll('.floor-selector button').forEach(button => {
        button.addEventListener('click', () => {
            const floor = button.dataset.floor;
            loadShopsForFloor(floor);
            document.querySelector('.floor-selector .active').classList.remove('active');
            button.classList.add('active');
        });
    });

    // Загрузка первого этажа по умолчанию
    loadShopsForFloor(1);
}

// Вспомогательные функции
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger animate-fade-in';
    errorDiv.textContent = message;
    document.querySelector('.error-container').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация тултипов
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Инициализация поповеров
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Обработка уведомлений
    function showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastBody = document.getElementById('notificationBody');
        
        if (toast && toastBody) {
            toastBody.textContent = message;
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        }
    }

    // Обработка чата
    if (typeof io !== 'undefined') {
        const socket = io();
        const userId = document.body.dataset.userId;

        if (userId) {
            socket.emit('join-chat', userId);

            socket.on('new-message', function(data) {
                showNotification('Новое сообщение: ' + data.message);
                updateUnreadMessages();
            });
        }
    }

    // Обновление счетчика непрочитанных сообщений
    function updateUnreadMessages() {
        const badge = document.getElementById('unreadMessages');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
            badge.style.display = 'inline-block';
        }
    }

    // Обработка форм с AJAX
    document.querySelectorAll('form[data-ajax="true"]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton.textContent;
            
            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Отправка...';
                
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: this.method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (response.ok) {
                    showNotification(data.message || 'Успешно!', 'success');
                    this.reset();
                } else {
                    throw new Error(data.message || 'Произошла ошибка');
                }
            } catch (error) {
                showNotification(error.message, 'danger');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    });

    // Обработка модальных окон
    document.querySelectorAll('.modal').forEach(modalEl => {
        const modal = new bootstrap.Modal(modalEl);
        
        modalEl.addEventListener('shown.bs.modal', function() {
            const input = this.querySelector('input, textarea');
            if (input) input.focus();
        });

        modalEl.addEventListener('hidden.bs.modal', function() {
            const form = this.querySelector('form');
            if (form) form.reset();
        });
    });

    // Анимация при скролле
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;

        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.add('fade-in');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Проверяем при загрузке страницы

    // Управление мобильным меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Выпадающее меню пользователя
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                menu.classList.toggle('show');
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });
        }
    });

    // Уведомления
    const notifications = document.querySelectorAll('.notification');
    
    notifications.forEach(notification => {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    });

    // Активные ссылки в навигации
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else if (currentPath.startsWith('/cinema') && link.getAttribute('href') === '/cinema') {
            link.classList.add('active');
        }
    });

    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Переключение темной темы
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Проверка сохраненной темы
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}); 