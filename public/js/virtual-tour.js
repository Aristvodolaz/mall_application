class VirtualTour {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.viewer = new Marzipano.Viewer(this.container);
        this.scenes = {};
        this.currentScene = null;
        this.hotspots = [];
        
        this.init();
    }

    init() {
        // Загрузка сцен
        this.loadScenes();
        
        // Добавление элементов управления
        this.addControls();
        
        // Добавление мини-карты
        this.addMinimap();
    }

    loadScenes() {
        const scenes = {
            entrance: {
                url: '/images/panoramas/entrance.jpg',
                position: { x: 0, y: 0 },
                hotspots: [
                    {
                        position: { yaw: 0.5, pitch: 0 },
                        type: 'scene',
                        target: 'mainHall',
                        title: 'В главный холл'
                    }
                ]
            },
            mainHall: {
                url: '/images/panoramas/main-hall.jpg',
                position: { x: 100, y: 0 },
                hotspots: [
                    {
                        position: { yaw: -2.5, pitch: 0 },
                        type: 'scene',
                        target: 'entrance',
                        title: 'К входу'
                    },
                    {
                        position: { yaw: 1.5, pitch: 0 },
                        type: 'scene',
                        target: 'foodCourt',
                        title: 'В фуд-корт'
                    },
                    {
                        position: { yaw: 0, pitch: 0 },
                        type: 'info',
                        title: 'Информационная стойка',
                        text: 'Здесь вы можете получить информацию о магазинах и услугах'
                    }
                ]
            },
            foodCourt: {
                url: '/images/panoramas/food-court.jpg',
                position: { x: 200, y: 0 },
                hotspots: [
                    {
                        position: { yaw: -1.5, pitch: 0 },
                        type: 'scene',
                        target: 'mainHall',
                        title: 'В главный холл'
                    }
                ]
            }
        };

        // Создание сцен
        for (const [id, data] of Object.entries(scenes)) {
            const source = Marzipano.ImageUrlSource.fromUrl(data.url);
            const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
            const limiter = Marzipano.RectilinearView.limit.traditional(
                4000,
                100 * Math.PI / 180
            );
            const view = new Marzipano.RectilinearView(null, limiter);
            
            const scene = this.viewer.createScene({
                source: source,
                geometry: geometry,
                view: view,
                pinFirstLevel: true
            });

            this.scenes[id] = {
                scene: scene,
                data: data
            };

            // Добавление хотспотов
            this.addHotspots(scene, data.hotspots);
        }

        // Показ первой сцены
        this.switchScene('entrance');
    }

    addHotspots(scene, hotspots) {
        hotspots.forEach(hotspot => {
            const element = document.createElement('div');
            element.className = `hotspot hotspot-${hotspot.type}`;
            
            const icon = document.createElement('div');
            icon.className = 'hotspot-icon';
            element.appendChild(icon);

            const tooltip = document.createElement('div');
            tooltip.className = 'hotspot-tooltip';
            tooltip.textContent = hotspot.title;
            element.appendChild(tooltip);

            // Обработчик клика
            element.addEventListener('click', () => {
                if (hotspot.type === 'scene') {
                    this.switchScene(hotspot.target);
                } else if (hotspot.type === 'info') {
                    this.showInfo(hotspot);
                }
            });

            scene.hotspotContainer().createHotspot(element, { yaw: hotspot.position.yaw, pitch: hotspot.position.pitch });
        });
    }

    switchScene(id) {
        if (this.currentScene) {
            this.currentScene.scene.hide();
        }
        
        const newScene = this.scenes[id];
        newScene.scene.show();
        
        // Обновление мини-карты
        this.updateMinimap(newScene.data.position);
        
        this.currentScene = newScene;
    }

    addControls() {
        const controls = document.createElement('div');
        controls.className = 'virtual-tour-controls';
        
        // Кнопки управления
        const buttons = [
            { icon: 'zoom-in', action: () => this.currentScene.scene.view().zoomIn() },
            { icon: 'zoom-out', action: () => this.currentScene.scene.view().zoomOut() },
            { icon: 'reset', action: () => this.currentScene.scene.view().setParameters({ yaw: 0, pitch: 0 }) }
        ];

        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `control-button ${button.icon}`;
            btn.addEventListener('click', button.action);
            controls.appendChild(btn);
        });

        this.container.appendChild(controls);
    }

    addMinimap() {
        const minimap = document.createElement('div');
        minimap.className = 'virtual-tour-minimap';
        
        // Создание SVG карты
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 200');
        
        // Добавление точек для каждой сцены
        Object.entries(this.scenes).forEach(([id, data]) => {
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            point.setAttribute('cx', data.data.position.x);
            point.setAttribute('cy', data.data.position.y);
            point.setAttribute('r', '5');
            point.setAttribute('class', 'minimap-point');
            point.setAttribute('data-scene', id);
            
            point.addEventListener('click', () => this.switchScene(id));
            
            svg.appendChild(point);
        });

        minimap.appendChild(svg);
        this.container.appendChild(minimap);
    }

    updateMinimap(position) {
        const points = this.container.querySelectorAll('.minimap-point');
        points.forEach(point => {
            point.classList.remove('active');
            if (point.dataset.scene === this.currentScene.id) {
                point.classList.add('active');
            }
        });
    }

    showInfo(hotspot) {
        const modal = document.createElement('div');
        modal.className = 'virtual-tour-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${hotspot.title}</h3>
                <p>${hotspot.text}</p>
                <button class="close-button">Закрыть</button>
            </div>
        `;

        modal.querySelector('.close-button').addEventListener('click', () => {
            modal.remove();
        });

        this.container.appendChild(modal);
    }
} 