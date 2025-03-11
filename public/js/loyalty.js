document.addEventListener('DOMContentLoaded', function() {
    // Элементы программы лояльности
    const loyaltyForm = document.getElementById('loyaltyForm');
    const loyaltyPhone = document.getElementById('loyaltyPhone');
    const loyaltySubmit = document.getElementById('loyaltySubmit');
    const loyaltyStatus = document.getElementById('loyaltyStatus');
    const loyaltyCards = document.querySelectorAll('.loyalty-card');
    
    // Маска для телефона
    if (loyaltyPhone) {
        loyaltyPhone.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = '+7 (' + value;
                } else if (value.length <= 6) {
                    value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3);
                } else if (value.length <= 8) {
                    value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
                } else if (value.length <= 10) {
                    value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8);
                } else {
                    value = '+7 (' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
                }
            }
            e.target.value = value;
        });
    }
    
    // Обработка отправки формы
    if (loyaltyForm) {
        loyaltyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация телефона
            const phoneValue = loyaltyPhone.value.replace(/\D/g, '');
            if (phoneValue.length < 10) {
                showStatus('Пожалуйста, введите корректный номер телефона', 'error');
                return;
            }
            
            // Имитация отправки запроса
            loyaltySubmit.disabled = true;
            loyaltySubmit.innerHTML = '<i class="bi bi-hourglass-split"></i> Отправка...';
            
            setTimeout(function() {
                showStatus('Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
                loyaltyForm.reset();
                loyaltySubmit.disabled = false;
                loyaltySubmit.innerHTML = 'Отправить заявку';
            }, 1500);
        });
    }
    
    // Функция отображения статуса
    function showStatus(message, type) {
        if (!loyaltyStatus) return;
        
        loyaltyStatus.textContent = message;
        loyaltyStatus.className = 'loyalty-status';
        loyaltyStatus.classList.add(type);
        loyaltyStatus.style.display = 'block';
        
        setTimeout(function() {
            loyaltyStatus.style.opacity = '1';
        }, 10);
        
        setTimeout(function() {
            loyaltyStatus.style.opacity = '0';
            setTimeout(function() {
                loyaltyStatus.style.display = 'none';
            }, 300);
        }, 5000);
    }
    
    // Анимация карт лояльности при прокрутке
    if (loyaltyCards.length > 0) {
        const animateLoyaltyCards = function() {
            loyaltyCards.forEach(card => {
                const cardPosition = card.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (cardPosition < screenPosition) {
                    card.classList.add('animate');
                }
            });
        };
        
        // Запуск анимации при загрузке и прокрутке
        animateLoyaltyCards();
        window.addEventListener('scroll', animateLoyaltyCards);
    }
}); 