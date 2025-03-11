const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Конфигурация подключения к базе данных
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mall_db',
    password: '1234',
    port: 5432,
});

async function migrate() {
    try {
        // Читаем файл миграции
        const migrationPath = path.join(__dirname, 'migrations', '001_initial.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Разделяем SQL на отдельные запросы
        const queries = sql.split(';').filter(query => query.trim());

        // Выполняем каждый запрос отдельно
        for (const query of queries) {
            try {
                await pool.query(query);
                console.log('Запрос выполнен успешно:', query.substring(0, 50) + '...');
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', query.substring(0, 50) + '...');
                console.error('Детали ошибки:', error);
                throw error;
            }
        }
        
        console.log('Миграции успешно применены');
    } catch (error) {
        console.error('Ошибка при применении миграций:', error);
    } finally {
        // Закрываем соединение с базой данных
        await pool.end();
    }
}

// Запускаем миграции
migrate(); 