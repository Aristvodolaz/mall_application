-- Создание таблицы магазинов
CREATE TABLE shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    full_description TEXT,
    floor INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    working_hours JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    main_image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы галереи магазинов
CREATE TABLE shop_gallery (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы категорий магазинов
CREATE TABLE shop_categories (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы акций
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    start_date DATE,
    end_date DATE,
    discount INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы товаров
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    image_url VARCHAR(255),
    is_popular BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы предпочтений пользователей
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR(255) NOT NULL,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category)
);

-- Создание таблицы истории посещений
CREATE TABLE visit_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы фильмов
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    description TEXT,
    duration INTEGER NOT NULL,
    release_date DATE NOT NULL,
    poster_url VARCHAR(255),
    trailer_url VARCHAR(255),
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    genre VARCHAR(100),
    director VARCHAR(255),
    cast TEXT,
    age_rating INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы сеансов
CREATE TABLE screenings (
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
    booked_seats JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы билетов
CREATE TABLE cinema_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    screening_id INTEGER REFERENCES screenings(id) ON DELETE CASCADE,
    seats JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    code VARCHAR(50) UNIQUE,
    qr_code TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов о фильмах
CREATE TABLE movie_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_floor ON shops(floor);
CREATE INDEX idx_shop_categories_category ON shop_categories(category);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_items_shop_popular ON items(shop_id, is_popular);
CREATE INDEX idx_user_preferences_category ON user_preferences(category);
CREATE INDEX idx_visit_history_user ON visit_history(user_id);

-- Индексы для таблиц кинотеатра
CREATE INDEX idx_movies_is_active ON movies(is_active);
CREATE INDEX idx_movies_is_featured ON movies(is_featured);
CREATE INDEX idx_screenings_movie_id ON screenings(movie_id);
CREATE INDEX idx_screenings_date ON screenings(date);
CREATE INDEX idx_cinema_tickets_user_id ON cinema_tickets(user_id);
CREATE INDEX idx_cinema_tickets_screening_id ON cinema_tickets(screening_id);
CREATE INDEX idx_movie_reviews_movie_id ON movie_reviews(movie_id);
CREATE INDEX idx_movie_reviews_user_id ON movie_reviews(user_id);

-- Функция для обновления рейтинга магазина
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Если удаляется отзыв
    IF (TG_OP = 'DELETE') THEN
        -- Получаем среднее значение рейтинга и количество отзывов
        SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
        INTO avg_rating, review_count
        FROM reviews
        WHERE shop_id = OLD.shop_id;
        
        -- Обновляем рейтинг и количество отзывов магазина
        UPDATE shops
        SET rating = COALESCE(avg_rating, 0),
            reviews_count = review_count
        WHERE id = OLD.shop_id;
    ELSE
        -- Получаем среднее значение рейтинга и количество отзывов
        SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
        INTO avg_rating, review_count
        FROM reviews
        WHERE shop_id = NEW.shop_id;
        
        -- Обновляем рейтинг и количество отзывов магазина
        UPDATE shops
        SET rating = COALESCE(avg_rating, 0),
            reviews_count = review_count
        WHERE id = NEW.shop_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггер для обновления рейтинга магазина
CREATE TRIGGER trigger_update_shop_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_shop_rating();

-- Функция для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления поля updated_at
CREATE TRIGGER trigger_update_shop_timestamp
BEFORE UPDATE ON shops
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице акций
CREATE TRIGGER trigger_update_promotion_timestamp
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице товаров
CREATE TRIGGER trigger_update_item_timestamp
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице предпочтений пользователей
CREATE TRIGGER trigger_update_user_preference_timestamp
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице фильмов
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице сеансов
CREATE TRIGGER update_screenings_updated_at
    BEFORE UPDATE ON screenings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице билетов
CREATE TRIGGER update_cinema_tickets_updated_at
    BEFORE UPDATE ON cinema_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления поля updated_at в таблице отзывов о фильмах
CREATE TRIGGER update_movie_reviews_updated_at
    BEFORE UPDATE ON movie_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 