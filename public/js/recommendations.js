class RecommendationSystem {
    constructor() {
        this.preferences = new Map();
        this.visitHistory = new Map();
        this.init();
    }

    init() {
        // Создание UI для рекомендаций
        this.createRecommendationsUI();
        
        // Загрузка предпочтений пользователя
        this.loadUserPreferences();
        
        // Отслеживание взаимодействий
        this.trackUserInteractions();
    }

    createRecommendationsUI() {
        const container = document.createElement('div');
        container.className = 'recommendations-container';
        
        const header = document.createElement('div');
        header.className = 'recommendations-header';
        header.innerHTML = `
            <h3>Персональные рекомендации</h3>
            <div class="recommendations-tabs">
                <button class="tab active" data-tab="shops">Магазины</button>
                <button class="tab" data-tab="events">События</button>
                <button class="tab" data-tab="food">Еда</button>
            </div>
        `;
        
        const content = document.createElement('div');
        content.className = 'recommendations-content';
        
        container.appendChild(header);
        container.appendChild(content);
        
        document.body.appendChild(container);
        
        // Обработчики для табов
        header.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    async loadUserPreferences() {
        try {
            const response = await fetch('/api/user/preferences');
            const data = await response.json();
            
            // Сохранение предпочтений
            data.forEach(pref => {
                this.preferences.set(pref.category, pref.score);
            });
            
            // Загрузка начальных рекомендаций
            this.updateRecommendations('shops');
        } catch (error) {
            console.error('Ошибка загрузки предпочтений:', error);
        }
    }

    trackUserInteractions() {
        // Отслеживание просмотров магазинов
        document.addEventListener('shopView', (e) => {
            this.updatePreference('shop', e.detail.category, 1);
        });
        
        // Отслеживание покупок
        document.addEventListener('purchase', (e) => {
            this.updatePreference('shop', e.detail.category, 3);
        });
        
        // Отслеживание посещений событий
        document.addEventListener('eventVisit', (e) => {
            this.updatePreference('event', e.detail.category, 2);
        });
    }

    updatePreference(type, category, score) {
        const currentScore = this.preferences.get(category) || 0;
        this.preferences.set(category, currentScore + score);
        
        // Обновление на сервере
        fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type,
                category,
                score: currentScore + score
            })
        });
        
        // Обновление рекомендаций
        this.updateRecommendations(type + 's');
    }

    async switchTab(tab) {
        // Визуальное обновление табов
        const tabs = document.querySelectorAll('.recommendations-tabs .tab');
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Загрузка рекомендаций для выбранной категории
        await this.updateRecommendations(tab);
    }

    async updateRecommendations(category) {
        try {
            // Получение рекомендаций с сервера
            const response = await fetch(`/api/recommendations/${category}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: Object.fromEntries(this.preferences)
                })
            });
            
            const recommendations = await response.json();
            
            // Отображение рекомендаций
            this.displayRecommendations(recommendations);
        } catch (error) {
            console.error('Ошибка получения рекомендаций:', error);
        }
    }

    displayRecommendations(recommendations) {
        const content = document.querySelector('.recommendations-content');
        content.innerHTML = '';
        
        recommendations.forEach(item => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <div class="recommendation-image">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="recommendation-badge">${this.getMatchScore(item.score)}% совпадение</div>
                </div>
                <div class="recommendation-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="recommendation-tags">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <button class="details-button">Подробнее</button>
                </div>
            `;
            
            // Анимация появления
            card.style.animation = 'slideIn 0.3s ease forwards';
            
            // Добавляем обработчик для кнопки деталей
            card.querySelector('.details-button').addEventListener('click', () => {
                this.showShopDetails(item.id);
            });
            
            content.appendChild(card);
        });
    }

    async showShopDetails(shopId) {
        try {
            // Получаем детальную информацию о магазине
            const response = await fetch(`/api/shops/${shopId}/details`);
            const shopDetails = await response.json();
            
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'shop-details-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-button">&times;</button>
                    
                    <div class="shop-gallery">
                        <div class="main-image">
                            <img src="${shopDetails.mainImage}" alt="${shopDetails.name}">
                        </div>
                        <div class="gallery-thumbnails">
                            ${shopDetails.gallery.map(img => `
                                <div class="thumbnail">
                                    <img src="${img}" alt="Gallery image">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="shop-info-container">
                        <h2>${shopDetails.name}</h2>
                        <div class="shop-rating">
                            ${this.generateStars(shopDetails.rating)}
                            <span>(${shopDetails.reviewsCount} отзывов)</span>
                        </div>

                        <div class="shop-details-grid">
                            <div class="detail-item">
                                <i class="material-icons">schedule</i>
                                <div>
                                    <h4>Часы работы</h4>
                                    <p>${shopDetails.workingHours}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="material-icons">location_on</i>
                                <div>
                                    <h4>Расположение</h4>
                                    <p>Этаж ${shopDetails.floor}, ${shopDetails.location}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="material-icons">local_offer</i>
                                <div>
                                    <h4>Категории</h4>
                                    <p>${shopDetails.categories.join(', ')}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="material-icons">phone</i>
                                <div>
                                    <h4>Контакты</h4>
                                    <p>${shopDetails.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div class="shop-description">
                            <h3>О магазине</h3>
                            <p>${shopDetails.fullDescription}</p>
                        </div>

                        <div class="current-promotions">
                            <h3>Текущие акции</h3>
                            <div class="promotions-grid">
                                ${shopDetails.promotions.map(promo => `
                                    <div class="promotion-card">
                                        <div class="promotion-image">
                                            <img src="${promo.image}" alt="${promo.title}">
                                        </div>
                                        <div class="promotion-info">
                                            <h4>${promo.title}</h4>
                                            <p>${promo.description}</p>
                                            <span class="promotion-date">До ${promo.end_date}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="popular-items">
                            <h3>Популярные товары</h3>
                            <div class="items-grid">
                                ${shopDetails.popularItems.map(item => `
                                    <div class="item-card">
                                        <img src="${item.image}" alt="${item.name}">
                                        <h4>${item.name}</h4>
                                        <p class="price">${item.price} ₽</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Добавляем обработчик закрытия
            modal.querySelector('.close-button').addEventListener('click', () => {
                modal.remove();
            });

            // Добавляем обработчики для галереи
            const thumbnails = modal.querySelectorAll('.thumbnail img');
            const mainImage = modal.querySelector('.main-image img');
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    mainImage.src = thumb.src;
                    thumbnails.forEach(t => t.parentElement.classList.remove('active'));
                    thumb.parentElement.classList.add('active');
                });
            });

            document.body.appendChild(modal);
        } catch (error) {
            console.error('Ошибка загрузки деталей магазина:', error);
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return `
            ${'<i class="material-icons">star</i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="material-icons">star_half</i>' : ''}
            ${'<i class="material-icons">star_border</i>'.repeat(emptyStars)}
        `;
    }

    getMatchScore(score) {
        // Преобразование оценки в процент совпадения
        return Math.round(score * 100);
    }

    // Методы для работы с историей посещений
    addToHistory(itemId, type) {
        const history = this.visitHistory.get(type) || [];
        history.unshift({
            id: itemId,
            timestamp: Date.now()
        });
        
        // Ограничение истории последними 50 элементами
        if (history.length > 50) {
            history.pop();
        }
        
        this.visitHistory.set(type, history);
        this.saveHistory();
    }

    async saveHistory() {
        try {
            await fetch('/api/user/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    history: Object.fromEntries(this.visitHistory)
                })
            });
        } catch (error) {
            console.error('Ошибка сохранения истории:', error);
        }
    }
} 