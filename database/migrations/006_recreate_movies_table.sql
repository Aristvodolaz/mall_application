-- Сохраняем существующие данные во временную таблицу
CREATE TEMP TABLE movies_backup AS SELECT * FROM movies;

-- Удаляем существующую таблицу и последовательность
DROP TABLE IF EXISTS movies CASCADE;
DROP SEQUENCE IF EXISTS movies_id_seq CASCADE;

-- Создаем последовательность заново
CREATE SEQUENCE movies_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- Создаем таблицу заново с правильной структурой
CREATE TABLE movies (
    id INTEGER NOT NULL DEFAULT nextval('movies_id_seq'::regclass),
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
    CONSTRAINT movies_pkey PRIMARY KEY (id),
    CONSTRAINT movies_rating_check CHECK (rating >= 0 AND rating <= 10),
    CONSTRAINT movies_age_rating_check CHECK (age_rating >= 0 AND age_rating <= 18)
);

-- Восстанавливаем данные из временной таблицы
INSERT INTO movies (
    id, title, original_title, description, duration, 
    release_date, end_date, poster_url, trailer_url, 
    rating, genre, director, cast, age_rating, 
    is_active, is_featured, is_new, coming_soon,
    created_at, updated_at
)
SELECT 
    id, title, original_title, description, duration,
    release_date::DATE, 
    CASE 
        WHEN end_date IS NOT NULL THEN end_date::DATE 
        ELSE NULL 
    END,
    poster_url, trailer_url,
    COALESCE(rating, 0), genre, director, cast, 
    COALESCE(age_rating, 0),
    COALESCE(is_active, true), 
    COALESCE(is_featured, false),
    COALESCE(is_new, false),
    COALESCE(coming_soon, false),
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM movies_backup;

-- Сбрасываем последовательность
SELECT setval('movies_id_seq', COALESCE((SELECT MAX(id) FROM movies), 1));

-- Создаем индексы
CREATE INDEX idx_movies_is_active ON movies(is_active);
CREATE INDEX idx_movies_is_featured ON movies(is_featured);
CREATE INDEX idx_movies_is_new ON movies(is_new);
CREATE INDEX idx_movies_coming_soon ON movies(coming_soon);
CREATE INDEX idx_movies_release_date ON movies(release_date);

-- Добавляем комментарии к таблице и колонкам
COMMENT ON TABLE movies IS 'Таблица фильмов';
COMMENT ON COLUMN movies.id IS 'Уникальный идентификатор фильма';
COMMENT ON COLUMN movies.title IS 'Название фильма';
COMMENT ON COLUMN movies.original_title IS 'Оригинальное название фильма';
COMMENT ON COLUMN movies.description IS 'Описание фильма';
COMMENT ON COLUMN movies.duration IS 'Продолжительность фильма в минутах';
COMMENT ON COLUMN movies.release_date IS 'Дата выхода фильма';
COMMENT ON COLUMN movies.end_date IS 'Дата окончания проката';
COMMENT ON COLUMN movies.poster_url IS 'URL постера фильма';
COMMENT ON COLUMN movies.trailer_url IS 'URL трейлера фильма';
COMMENT ON COLUMN movies.rating IS 'Рейтинг фильма (0-10)';
COMMENT ON COLUMN movies.genre IS 'Жанр фильма';
COMMENT ON COLUMN movies.director IS 'Режиссер фильма';
COMMENT ON COLUMN movies.cast IS 'Актерский состав';
COMMENT ON COLUMN movies.age_rating IS 'Возрастное ограничение';
COMMENT ON COLUMN movies.is_active IS 'Флаг активности фильма';
COMMENT ON COLUMN movies.is_featured IS 'Флаг особого размещения';
COMMENT ON COLUMN movies.is_new IS 'Флаг новинки';
COMMENT ON COLUMN movies.coming_soon IS 'Флаг скорого выхода';
COMMENT ON COLUMN movies.created_at IS 'Дата создания записи';
COMMENT ON COLUMN movies.updated_at IS 'Дата последнего обновления';

-- Создаем триггер для автоматического обновления updated_at
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