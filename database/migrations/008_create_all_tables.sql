-- Создание таблицы users если она не существует
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы movies если она не существует
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    release_date DATE NOT NULL,
    end_date DATE,
    rating DECIMAL(3,1) DEFAULT 0,
    age_rating INTEGER DEFAULT 0,
    poster_url TEXT,
    is_new BOOLEAN DEFAULT false,
    coming_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы screenings если она не существует
CREATE TABLE IF NOT EXISTS screenings (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    hall VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы movie_reviews если она не существует
CREATE TABLE IF NOT EXISTS movie_reviews (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы shops если она не существует
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    category VARCHAR(100),
    image_url TEXT,
    opening_hours VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы events если она не существует
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы promotions если она не существует
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_percent INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы cinema_tickets если она не существует
CREATE TABLE IF NOT EXISTS cinema_tickets (
    id SERIAL PRIMARY KEY,
    screening_id INTEGER REFERENCES screenings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление тестовых данных для movies
INSERT INTO movies (title, description, duration, release_date, age_rating, poster_url, is_new)
VALUES 
('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 148, '2024-03-15', 12, 'https://example.com/inception.jpg', true),
('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 152, '2024-03-20', 16, 'https://example.com/dark-knight.jpg', true)
ON CONFLICT DO NOTHING;

-- Добавление тестовых данных для screenings
INSERT INTO screenings (movie_id, date, time, hall, price, available_seats)
SELECT 
    m.id,
    CURRENT_DATE + i,
    '18:00'::TIME,
    'Зал ' || (i % 3 + 1)::TEXT,
    1000,
    100
FROM movies m
CROSS JOIN generate_series(0, 6) i
ON CONFLICT DO NOTHING;

-- Добавление тестовых данных для shops
INSERT INTO shops (name, description, location, category, opening_hours)
VALUES 
('Спортмастер', 'Магазин спортивных товаров', '2 этаж', 'Спорт', '10:00-22:00'),
('DNS', 'Магазин электроники', '1 этаж', 'Электроника', '10:00-22:00')
ON CONFLICT DO NOTHING;

-- Добавление тестовых данных для events
INSERT INTO events (title, description, date, time, location, price)
VALUES 
('Мастер-класс по йоге', 'Бесплатный мастер-класс для начинающих', CURRENT_DATE + 1, '11:00', 'Фитнес-центр', 0),
('Детский праздник', 'Развлекательная программа для детей', CURRENT_DATE + 2, '12:00', 'Центральный атриум', 500)
ON CONFLICT DO NOTHING;

-- Добавление тестовых данных для promotions
INSERT INTO promotions (shop_id, title, description, start_date, end_date, discount_percent)
SELECT 
    s.id,
    'Весенняя распродажа',
    'Скидки до 50% на весь ассортимент',
    CURRENT_DATE,
    CURRENT_DATE + 30,
    50
FROM shops s
ON CONFLICT DO NOTHING; 