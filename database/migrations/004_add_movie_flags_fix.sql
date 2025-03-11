-- Добавление полей is_new и coming_soon в таблицу movies
ALTER TABLE IF EXISTS public.movies
    ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS coming_soon boolean DEFAULT false;

-- Обновление существующих записей
UPDATE public.movies
SET is_new = false,
    coming_soon = false
WHERE is_new IS NULL OR coming_soon IS NULL; 