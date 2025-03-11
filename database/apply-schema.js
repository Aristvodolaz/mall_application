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

async function applySchema() {
    try {
        // Читаем файл схемы
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Выполняем SQL-запрос
        await pool.query(sql);
        
        console.log('Схема базы данных успешно применена');
    } catch (error) {
        console.error('Ошибка при применении схемы базы данных:', error);
    } finally {
        // Закрываем соединение с базой данных
        await pool.end();
    }
}

// Запускаем применение схемы
applySchema(); 