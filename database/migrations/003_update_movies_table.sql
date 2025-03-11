-- Обновление таблицы movies
ALTER TABLE movies
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT false;

-- Обновление значений по умолчанию
ALTER TABLE movies
ALTER COLUMN rating SET DEFAULT 0,
ALTER COLUMN age_rating SET DEFAULT 0; 