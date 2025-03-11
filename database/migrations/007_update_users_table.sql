-- Обновление таблицы users
ALTER TABLE IF EXISTS public.users
    ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Обновляем существующие записи, используя email как username
UPDATE public.users
SET username = email
WHERE username IS NULL;

-- Добавляем ограничения после обновления данных
ALTER TABLE public.users
    ALTER COLUMN username SET NOT NULL,
    ADD CONSTRAINT users_username_unique UNIQUE (username); 