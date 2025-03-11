// Инициализация 3D модели ТЦ
function initMallModel(containerId) {
    // Проверяем наличие контейнера
    const container = document.getElementById(containerId);
    if (!container) return;

    // Создаем сцену, камеру и рендерер
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(
        60, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(15, 15, 15);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Создаем простую модель ТЦ
    createMallModel(scene);
    
    // Добавляем контроль камеры
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Добавляем элементы управления
    addControls(container, scene, camera, controls);
}

// Создание модели ТЦ
function createMallModel(scene) {
    // Земля
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7ec850,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Дорога
    const roadGeometry = new THREE.PlaneGeometry(5, 20);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(10, 0.01, 0);
    road.receiveShadow = true;
    scene.add(road);
    
    // Основное здание ТЦ
    const buildingGeometry = new THREE.BoxGeometry(20, 10, 15);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf0f0f0,
        roughness: 0.3,
        metalness: 0.5
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(0, 5, 0);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
    
    // Крыша
    const roofGeometry = new THREE.BoxGeometry(22, 1, 17);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2196f3,
        roughness: 0.4,
        metalness: 0.6
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 10.5, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    scene.add(roof);
    
    // Вход
    const entranceGeometry = new THREE.BoxGeometry(5, 5, 2);
    const entranceMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2196f3,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, 2.5, 8.5);
    entrance.castShadow = true;
    entrance.receiveShadow = true;
    scene.add(entrance);
    
    // Окна
    createWindows(scene, building);
    
    // Парковка
    createParking(scene);
    
    // Деревья
    createTrees(scene);
    
    // Название ТЦ
    createMallSign(scene);
}

// Создание окон
function createWindows(scene, building) {
    const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x81d4fa,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    // Окна на передней стороне
    for (let i = -8; i <= 8; i += 4) {
        for (let j = 2; j <= 8; j += 3) {
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(i, j, 7.51);
            windowMesh.castShadow = false;
            windowMesh.receiveShadow = false;
            scene.add(windowMesh);
        }
    }
    
    // Окна на боковых сторонах
    for (let i = -5; i <= 5; i += 5) {
        for (let j = 2; j <= 8; j += 3) {
            const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
            leftWindow.position.set(-10.01, j, i);
            leftWindow.rotation.y = Math.PI / 2;
            leftWindow.castShadow = false;
            leftWindow.receiveShadow = false;
            scene.add(leftWindow);
            
            const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
            rightWindow.position.set(10.01, j, i);
            rightWindow.rotation.y = Math.PI / 2;
            rightWindow.castShadow = false;
            rightWindow.receiveShadow = false;
            scene.add(rightWindow);
        }
    }
}

// Создание парковки
function createParking(scene) {
    const parkingGeometry = new THREE.PlaneGeometry(15, 10);
    const parkingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x424242,
        roughness: 0.9,
        metalness: 0.1
    });
    const parking = new THREE.Mesh(parkingGeometry, parkingMaterial);
    parking.rotation.x = -Math.PI / 2;
    parking.position.set(-12, 0.02, 0);
    parking.receiveShadow = true;
    scene.add(parking);
    
    // Разметка парковки
    const lineGeometry = new THREE.PlaneGeometry(0.2, 4);
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1
    });
    
    for (let i = -6; i <= 6; i += 2) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-12 + i, 0.03, 0);
        line.receiveShadow = true;
        scene.add(line);
    }
}

// Создание деревьев
function createTrees(scene) {
    const positions = [
        [-8, 0, 10],
        [-5, 0, 12],
        [5, 0, 12],
        [8, 0, 10],
        [-15, 0, -5],
        [-18, 0, -8],
        [15, 0, -5],
        [18, 0, -8]
    ];
    
    positions.forEach(pos => {
        // Ствол
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x795548,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(pos[0], pos[1] + 0.75, pos[2]);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        scene.add(trunk);
        
        // Крона
        const crownGeometry = new THREE.ConeGeometry(1, 2, 8);
        const crownMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4caf50,
            roughness: 0.8,
            metalness: 0.2
        });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(pos[0], pos[1] + 2.5, pos[2]);
        crown.castShadow = true;
        crown.receiveShadow = true;
        scene.add(crown);
    });
}

// Создание вывески ТЦ
function createMallSign(scene) {
    const signGeometry = new THREE.BoxGeometry(10, 2, 0.5);
    const signMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2196f3,
        roughness: 0.3,
        metalness: 0.7
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 12, 0);
    sign.castShadow = true;
    sign.receiveShadow = true;
    scene.add(sign);
}

// Добавление элементов управления
function addControls(container, scene, camera, orbitControls) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'model-controls';
    container.appendChild(controlsDiv);
    
    // Кнопка сброса камеры
    const resetButton = document.createElement('button');
    resetButton.className = 'model-control-btn';
    resetButton.innerHTML = '<i class="bi bi-house"></i>';
    resetButton.title = 'Сбросить вид';
    resetButton.addEventListener('click', () => {
        camera.position.set(15, 15, 15);
        orbitControls.target.set(0, 0, 0);
        orbitControls.update();
    });
    controlsDiv.appendChild(resetButton);
    
    // Кнопка переключения этажей
    const floors = ['1', '2', '3'];
    floors.forEach((floor, index) => {
        const floorButton = document.createElement('button');
        floorButton.className = 'model-control-btn';
        floorButton.textContent = floor;
        floorButton.title = `${floor} этаж`;
        floorButton.addEventListener('click', () => {
            // Здесь можно добавить логику переключения этажей
            // Например, скрывать/показывать части модели
            alert(`Переключение на ${floor} этаж`);
        });
        controlsDiv.appendChild(floorButton);
    });
}

// Экспорт функции инициализации
window.initMallModel = initMallModel; 