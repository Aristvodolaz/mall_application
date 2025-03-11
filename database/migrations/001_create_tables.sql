-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы фильмов
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    description TEXT,
    duration INTEGER NOT NULL,
    release_date DATE NOT NULL,
    end_date DATE,
    poster_url TEXT,
    trailer_url TEXT,
    rating DECIMAL(3,1) DEFAULT 0,
    genre VARCHAR(100),
    director VARCHAR(255),
    cast TEXT,
    age_rating INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    coming_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movies_rating_check CHECK (rating >= 0 AND rating <= 10),
    CONSTRAINT movies_age_rating_check CHECK (age_rating >= 0 AND age_rating <= 18)
);

-- Создание таблицы сеансов
CREATE TABLE IF NOT EXISTS screenings (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    hall INTEGER NOT NULL,
    is_3d BOOLEAN DEFAULT false,
    is_imax BOOLEAN DEFAULT false,
    base_price DECIMAL(10,2) NOT NULL,
    vip_price DECIMAL(10,2),
    student_price DECIMAL(10,2),
    child_price DECIMAL(10,2),
    seats_layout JSON NOT NULL,
    booked_seats JSON DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов к фильмам
CREATE TABLE IF NOT EXISTS movie_reviews (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movie_reviews_rating_check CHECK (rating >= 1 AND rating <= 10)
);

-- Создание таблицы билетов в кино
CREATE TABLE IF NOT EXISTS cinema_tickets (
    id SERIAL PRIMARY KEY,
    screening_id INTEGER NOT NULL REFERENCES screenings(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    seat_number VARCHAR(10) NOT NULL,
    row_number INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    ticket_type VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'active',
    payment_status VARCHAR(50) DEFAULT 'pending',
    ticket_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX idx_movies_is_active ON movies(is_active);
CREATE INDEX idx_movies_is_featured ON movies(is_featured);
CREATE INDEX idx_movies_is_new ON movies(is_new);
CREATE INDEX idx_movies_coming_soon ON movies(coming_soon);
CREATE INDEX idx_movies_release_date ON movies(release_date);

CREATE INDEX idx_screenings_movie_id ON screenings(movie_id);
CREATE INDEX idx_screenings_date ON screenings(date);
CREATE INDEX idx_screenings_is_active ON screenings(is_active);

CREATE INDEX idx_movie_reviews_movie_id ON movie_reviews(movie_id);
CREATE INDEX idx_movie_reviews_user_id ON movie_reviews(user_id);

CREATE INDEX idx_cinema_tickets_screening_id ON cinema_tickets(screening_id);
CREATE INDEX idx_cinema_tickets_user_id ON cinema_tickets(user_id);
CREATE INDEX idx_cinema_tickets_ticket_code ON cinema_tickets(ticket_code);

-- Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screenings_updated_at
    BEFORE UPDATE ON screenings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movie_reviews_updated_at
    BEFORE UPDATE ON movie_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cinema_tickets_updated_at
    BEFORE UPDATE ON cinema_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 