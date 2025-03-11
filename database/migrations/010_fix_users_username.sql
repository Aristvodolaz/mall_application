-- Создаем временную таблицу
CREATE TABLE IF NOT EXISTS users_temp AS 
SELECT * FROM users;

-- Удаляем старую таблицу
DROP TABLE IF EXISTS users;

-- Создаем таблицу заново с правильной структурой
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Копируем данные из временной таблицы, устанавливая username равным email для существующих записей
INSERT INTO users (id, email, username, password, avatar_url, role, is_active, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(username, SPLIT_PART(email, '@', 1)),
    password,
    avatar_url,
    COALESCE(role, 'user'),
    COALESCE(is_active, true),
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM users_temp;

-- Восстанавливаем последовательность
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Удаляем временную таблицу
DROP TABLE IF EXISTS users_temp; 