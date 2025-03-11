const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Конфигурация подключения к базе данных
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'malls_db',
    password: '1234',
    port: 5432,
});

async function seed() {
    try {
        // Читаем SQL-файл
        const sqlPath = path.join(__dirname, 'seed.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Выполняем SQL-запросы
        await pool.query(sql);
        
        console.log('База данных успешно заполнена тестовыми данными');
    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error);
    } finally {
        // Закрываем соединение с базой данных
        await pool.end();
    }
}

// Запускаем заполнение базы данных
seed(); 