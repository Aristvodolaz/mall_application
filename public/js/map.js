// Инициализация карты при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Координаты ТЦ (замените на реальные координаты)
    const mallLocation = { lat: 55.7558, lng: 37.6173 };

    // Создание карты
    const map = new google.maps.Map(document.getElementById('map'), {
        center: mallLocation,
        zoom: 15,
        styles: [
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [
                    { "visibility": "off" }
                ]
            }
        ]
    });

    // Добавление маркера
    const marker = new google.maps.Marker({
        position: mallLocation,
        map: map,
        title: 'ТРЦ "Кристалл"',
        animation: google.maps.Animation.DROP
    });

    // Добавление информационного окна
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="map-info-window">
                <h3>ТРЦ "Кристалл"</h3>
                <p>г. Москва, ул. Примерная, д. 1</p>
                <p>Ежедневно с 10:00 до 22:00</p>
            </div>
        `
    });

    // Открытие информационного окна при клике на маркер
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    // Добавление кнопки для определения местоположения пользователя
    const locationButton = document.createElement('button');
    locationButton.classList.add('custom-map-control');
    locationButton.innerHTML = '<i class="bi bi-geo-alt"></i>';
    locationButton.title = 'Моё местоположение';

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

    // Обработчик клика по кнопке определения местоположения
    locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Построение маршрута до ТЦ
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true
                    });

                    directionsService.route({
                        origin: pos,
                        destination: mallLocation,
                        travelMode: google.maps.TravelMode.DRIVING
                    }, (response, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(response);
                            // Показываем время в пути
                            const duration = response.routes[0].legs[0].duration.text;
                            infoWindow.setContent(`
                                <div class="map-info-window">
                                    <h3>ТРЦ "Кристалл"</h3>
                                    <p>г. Москва, ул. Примерная, д. 1</p>
                                    <p>Время в пути: ${duration}</p>
                                </div>
                            `);
                            infoWindow.open(map, marker);
                        }
                    });
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
});

// Обработка ошибок геолокации
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? 'Ошибка: Сервис геолокации недоступен.'
            : 'Ошибка: Ваш браузер не поддерживает геолокацию.'
    );
    infoWindow.open(map);
} 