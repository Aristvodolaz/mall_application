-- Добавляем поле username с возможностью NULL
ALTER TABLE IF EXISTS public.users
    ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Обновляем существующие записи
UPDATE public.users
SET username = email
WHERE username IS NULL;

-- Добавляем ограничения
ALTER TABLE IF EXISTS public.users
    ALTER COLUMN username SET NOT NULL,
    ADD CONSTRAINT users_username_unique UNIQUE (username); 