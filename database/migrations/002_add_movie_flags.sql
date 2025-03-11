-- Добавление новых полей в таблицу movies
ALTER TABLE movies
ADD COLUMN is_new BOOLEAN DEFAULT false,
ADD COLUMN coming_soon BOOLEAN DEFAULT false; 