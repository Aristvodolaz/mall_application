const { Pool } = require('pg');

// Конфигурация подключения к базе данных
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mall_db',
    password: '1234',
    port: 5432,
});

async function seedCinema() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Создаем таблицы, если они не существуют
        await client.query(`
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
            )
        `);
        
        await client.query(`
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
            )
        `);
        
        await client.query(`
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
            )
        `);
        
        await client.query(`
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
            )
        `);
        
        // Очищаем таблицы
        await client.query('DELETE FROM cinema_tickets');
        await client.query('DELETE FROM screenings');
        await client.query('DELETE FROM movie_reviews');
        await client.query('DELETE FROM movies');
        
        // Добавляем фильмы
        const moviesResult = await client.query(`
            INSERT INTO movies (
                title, 
                original_title, 
                description, 
                duration, 
                release_date, 
                poster_url, 
                trailer_url, 
                rating, 
                genre, 
                director, 
                cast, 
                age_rating, 
                is_active, 
                is_featured
            ) VALUES 
            (
                'Дюна: Часть вторая', 
                'Dune: Part Two', 
                'Пол Атрейдес объединяется с Чани и фрименами, чтобы отомстить тем, кто уничтожил его семью. Ему предстоит сделать выбор между любовью всей его жизни и судьбой известной вселенной.', 
                166, 
                '2024-02-29', 
                '/images/movies/dune2.jpg', 
                'https://www.youtube.com/embed/qQ6j_SrW4EM', 
                8.5, 
                'Фантастика', 
                'Дени Вильнёв', 
                'Тимоти Шаламе, Зендея, Ребекка Фергюсон, Джош Бролин', 
                12, 
                true, 
                true
            ),
            (
                'Переводчик', 
                'The Interpreter', 
                'История афганского переводчика, который помогал американским войскам во время войны. Теперь он должен спасти свою семью от талибов.', 
                135, 
                '2024-03-14', 
                '/images/movies/interpreter.jpg', 
                'https://www.youtube.com/embed/example2', 
                7.8, 
                'Драма', 
                'Гай Ричи', 
                'Джейк Джилленхол, Дар Салим, Эмили Бичем', 
                16, 
                true, 
                false
            ),
            (
                'Гражданская оборона', 
                'Civil Defense', 
                'Группа спасателей МЧС противостоит природной катастрофе, пытаясь спасти жителей города.', 
                120, 
                '2024-03-21', 
                '/images/movies/civil-defense.jpg', 
                'https://www.youtube.com/embed/example3', 
                7.2, 
                'Катастрофа', 
                'Николай Лебедев', 
                'Александр Петров, Виктория Исакова, Владимир Машков', 
                12, 
                true, 
                true
            ) RETURNING id
        `);
        
        const movieIds = moviesResult.rows.map(row => row.id);
        
        // Добавляем сеансы
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        await client.query(`
            INSERT INTO screenings (
                movie_id, 
                date, 
                time, 
                hall, 
                is_3d, 
                is_imax, 
                base_price, 
                vip_price, 
                student_price, 
                child_price, 
                seats_layout, 
                booked_seats, 
                is_active
            ) VALUES 
            (
                ${movieIds[0]}, 
                '${formattedDate}', 
                '10:00:00', 
                1, 
                false, 
                true, 
                500, 
                800, 
                400, 
                300, 
                '[
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]', 
                '[]', 
                true
            ),
            (
                ${movieIds[0]}, 
                '${formattedDate}', 
                '13:00:00', 
                1, 
                true, 
                true, 
                600, 
                900, 
                500, 
                400, 
                '[
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,2,2,2,2,2,2,1,1],
                    [1,1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1,1]
                ]', 
                '[]', 
                true
            ),
            (
                ${movieIds[1]}, 
                '${formattedDate}', 
                '11:30:00', 
                2, 
                false, 
                false, 
                400, 
                600, 
                300, 
                200, 
                '[
                    [1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1],
                    [1,1,2,2,2,2,1,1],
                    [1,1,2,2,2,2,1,1],
                    [1,1,1,1,1,1,1,1]
                ]', 
                '[]', 
                true
            ),
            (
                ${movieIds[2]}, 
                '${formattedDate}', 
                '12:00:00', 
                3, 
                true, 
                false, 
                450, 
                650, 
                350, 
                250, 
                '[
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,2,2,2,2,2,1,1],
                    [1,1,2,2,2,2,2,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,1,1,1,1,1,1,1]
                ]', 
                '[]', 
                true
            )
        `);
        
        // Добавляем отзывы
        await client.query(`
            INSERT INTO movie_reviews (
                user_id, 
                movie_id, 
                rating, 
                comment, 
                is_approved
            ) VALUES 
            (1, ${movieIds[0]}, 9, 'Потрясающий фильм! Визуальные эффекты и сюжет на высоте.', true),
            (2, ${movieIds[0]}, 8, 'Отличное продолжение первой части. Рекомендую к просмотру.', true),
            (3, ${movieIds[1]}, 7, 'Сильная драма с отличной игрой актеров.', true),
            (1, ${movieIds[2]}, 8, 'Захватывающий фильм-катастрофа. Держит в напряжении до конца.', true)
        `);
        
        await client.query('COMMIT');
        console.log('База данных кинотеатра успешно заполнена тестовыми данными');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при заполнении базы данных кинотеатра:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

seedCinema(); 