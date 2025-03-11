-- Создание таблицы фильмов
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    description TEXT,
    duration INTEGER NOT NULL,
    release_date DATE NOT NULL,
    poster_url VARCHAR(255),
    trailer_url VARCHAR(255),
    rating DECIMAL(3,1) DEFAULT 0,
    genre VARCHAR(100),
    director VARCHAR(255),
    cast TEXT,
    age_rating INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы сеансов
CREATE TABLE IF NOT EXISTS screenings (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    hall INTEGER NOT NULL,
    is_3d BOOLEAN DEFAULT false,
    is_imax BOOLEAN DEFAULT false,
    base_price INTEGER NOT NULL,
    vip_price INTEGER NOT NULL,
    student_price INTEGER NOT NULL,
    child_price INTEGER NOT NULL,
    seats_layout JSONB NOT NULL,
    booked_seats JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы билетов
CREATE TABLE IF NOT EXISTS cinema_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    screening_id INTEGER REFERENCES screenings(id) ON DELETE CASCADE,
    seats JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    code VARCHAR(50) UNIQUE,
    qr_code TEXT,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов о фильмах
CREATE TABLE IF NOT EXISTS movie_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- Индексы для таблиц кинотеатра
CREATE INDEX IF NOT EXISTS idx_movies_is_active ON movies(is_active);
CREATE INDEX IF NOT EXISTS idx_movies_is_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_screenings_movie_id ON screenings(movie_id);
CREATE INDEX IF NOT EXISTS idx_screenings_date ON screenings(date);
CREATE INDEX IF NOT EXISTS idx_cinema_tickets_user_id ON cinema_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_cinema_tickets_screening_id ON cinema_tickets(screening_id);
CREATE INDEX IF NOT EXISTS idx_movie_reviews_movie_id ON movie_reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_reviews_user_id ON movie_reviews(user_id); 