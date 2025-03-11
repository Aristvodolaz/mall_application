class ARNavigation {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Проверка поддержки WebXR
            if (!navigator.xr) {
                throw new Error('WebXR не поддерживается вашим браузером');
            }

            // Запрос доступа к AR
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                throw new Error('AR не поддерживается вашим устройством');
            }

            this.initUI();
            this.initARSession();
        } catch (error) {
            console.error('Ошибка инициализации AR:', error);
            this.showFallback();
        }
    }

    initUI() {
        // Создание UI элементов
        this.container = document.createElement('div');
        this.container.className = 'ar-navigation';
        
        // Поиск магазина
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Найти магазин...';
        this.searchInput.className = 'ar-search-input';
        
        // Кнопка запуска AR
        this.startButton = document.createElement('button');
        this.startButton.className = 'ar-start-button';
        this.startButton.textContent = 'Начать AR-навигацию';
        
        this.container.appendChild(this.searchInput);
        this.container.appendChild(this.startButton);
        
        document.body.appendChild(this.container);
        
        // Обработчики событий
        this.searchInput.addEventListener('input', () => this.updateSearch());
        this.startButton.addEventListener('click', () => this.startARNavigation());
    }

    async initARSession() {
        try {
            // Создание XR сессии
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'dom-overlay'],
                domOverlay: { root: this.container }
            });

            // Настройка WebGL
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl', { xrCompatible: true });
            
            // Создание Three.js сцены
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();
            this.renderer = new THREE.WebGLRenderer({
                canvas,
                context: gl,
                alpha: true,
            });

            // Добавление источника света
            const light = new THREE.AmbientLight(0xffffff, 1);
            this.scene.add(light);

            // Настройка XR рендеринга
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local');
            
            // Запуск рендер-цикла
            session.updateRenderState({
                baseLayer: new XRWebGLLayer(session, gl)
            });

            this.session = session;
            this.initARContent();
        } catch (error) {
            console.error('Ошибка создания AR сессии:', error);
            this.showFallback();
        }
    }

    initARContent() {
        // Загрузка 3D моделей и маркеров
        const loader = new THREE.GLTFLoader();
        
        // Загрузка маркера-стрелки
        loader.load('/models/arrow.glb', (gltf) => {
            this.arrowModel = gltf.scene;
            this.arrowModel.scale.set(0.2, 0.2, 0.2);
            this.scene.add(this.arrowModel);
        });

        // Загрузка маркеров магазинов
        this.shopMarkers = new Map();
        this.loadShopMarkers();
    }

    async loadShopMarkers() {
        try {
            // Загрузка данных о магазинах
            const response = await fetch('/api/shops/locations');
            const shops = await response.json();

            shops.forEach(shop => {
                // Создание 3D маркера для каждого магазина
                const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                const markerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.7
                });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                
                // Позиционирование маркера
                marker.position.set(shop.x, shop.y, shop.z);
                
                // Добавление информации о магазине
                marker.userData = {
                    id: shop.id,
                    name: shop.name,
                    category: shop.category,
                    floor: shop.floor
                };
                
                this.shopMarkers.set(shop.id, marker);
                this.scene.add(marker);
            });
        } catch (error) {
            console.error('Ошибка загрузки маркеров:', error);
        }
    }

    updateSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        // Подсветка найденных магазинов
        this.shopMarkers.forEach(marker => {
            const name = marker.userData.name.toLowerCase();
            const category = marker.userData.category.toLowerCase();
            
            if (name.includes(searchTerm) || category.includes(searchTerm)) {
                marker.material.color.setHex(0xff0000);
                marker.material.opacity = 1;
            } else {
                marker.material.color.setHex(0x00ff00);
                marker.material.opacity = 0.7;
            }
        });
    }

    startARNavigation() {
        const searchTerm = this.searchInput.value.toLowerCase();
        let targetMarker = null;
        
        // Поиск целевого магазина
        this.shopMarkers.forEach(marker => {
            const name = marker.userData.name.toLowerCase();
            if (name === searchTerm) {
                targetMarker = marker;
            }
        });
        
        if (targetMarker) {
            this.showRoute(targetMarker);
        } else {
            alert('Магазин не найден');
        }
    }

    showRoute(targetMarker) {
        // Получение текущей позиции пользователя
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const userPosition = new THREE.Vector3(
                    position.coords.longitude,
                    0,
                    position.coords.latitude
                );
                
                // Создание линии маршрута
                const points = [];
                points.push(userPosition);
                points.push(targetMarker.position);
                
                const routeGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const routeMaterial = new THREE.LineBasicMaterial({
                    color: 0x0000ff,
                    linewidth: 3
                });
                
                const route = new THREE.Line(routeGeometry, routeMaterial);
                this.scene.add(route);
                
                // Анимация стрелки по маршруту
                this.animateArrow(userPosition, targetMarker.position);
            });
        }
    }

    animateArrow(start, end) {
        if (!this.arrowModel) return;
        
        // Направление стрелки
        const direction = end.clone().sub(start).normalize();
        this.arrowModel.lookAt(direction);
        
        // Анимация движения
        const distance = start.distanceTo(end);
        const duration = distance * 1000; // миллисекунды
        
        gsap.to(this.arrowModel.position, {
            x: end.x,
            y: end.y,
            z: end.z,
            duration: duration / 1000,
            ease: 'none',
            onUpdate: () => {
                // Обновление подсказок
                this.updateNavigationHints();
            }
        });
    }

    updateNavigationHints() {
        // Расчет расстояния до цели
        const distance = this.arrowModel.position.distanceTo(this.targetMarker.position);
        
        // Обновление UI подсказок
        const hintElement = document.createElement('div');
        hintElement.className = 'ar-hint';
        hintElement.textContent = `До магазина: ${Math.round(distance)} метров`;
        
        // Добавление направления
        if (distance < 5) {
            hintElement.textContent += '\nВы почти на месте!';
        } else {
            const direction = this.getDirection();
            hintElement.textContent += `\nНаправление: ${direction}`;
        }
        
        // Обновление DOM
        const oldHint = document.querySelector('.ar-hint');
        if (oldHint) {
            oldHint.remove();
        }
        this.container.appendChild(hintElement);
    }

    getDirection() {
        // Расчет направления движения
        const forward = new THREE.Vector3(0, 0, -1);
        const arrowDirection = this.arrowModel.getWorldDirection(new THREE.Vector3());
        
        const angle = forward.angleTo(arrowDirection) * (180 / Math.PI);
        
        if (angle < 22.5) return 'Прямо';
        if (angle < 67.5) return 'Направо';
        if (angle < 112.5) return 'Назад';
        if (angle < 157.5) return 'Налево';
        return 'Прямо';
    }

    showFallback() {
        // Показ 2D карты, если AR недоступен
        const fallbackMap = document.createElement('div');
        fallbackMap.className = 'fallback-map';
        
        const mapTitle = document.createElement('h3');
        mapTitle.textContent = 'AR-навигация недоступна';
        
        const mapDescription = document.createElement('p');
        mapDescription.textContent = 'Используйте 2D карту для навигации:';
        
        fallbackMap.appendChild(mapTitle);
        fallbackMap.appendChild(mapDescription);
        
        // Добавление 2D карты
        const map = document.createElement('div');
        map.id = 'map2d';
        fallbackMap.appendChild(map);
        
        this.container.appendChild(fallbackMap);
        
        // Инициализация 2D карты
        this.init2DMap();
    }

    init2DMap() {
        // Инициализация 2D карты (например, с помощью Leaflet)
        const map = L.map('map2d').setView([51.505, -0.09], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Добавление маркеров магазинов
        this.shopMarkers.forEach(marker => {
            const { name, category } = marker.userData;
            const position = marker.position;
            
            L.marker([position.z, position.x])
                .bindPopup(`<b>${name}</b><br>${category}`)
                .addTo(map);
        });
    }
} 