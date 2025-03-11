require('dotenv').config();
const { Client } = require('pg');

async function initDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    try {
        await client.connect();

        // Создаем базу данных, если она не существует
        await client.query(`
            SELECT 'CREATE DATABASE mall_db'
            WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mall_db')
        `);

        console.log('База данных успешно создана или уже существует');

        // Создаем расширение для поиска
        await client.query(`
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `);

        console.log('Расширение pg_trgm успешно установлено');

    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
    } finally {
        await client.end();
    }
}

// Запускаем инициализацию
initDatabase(); 