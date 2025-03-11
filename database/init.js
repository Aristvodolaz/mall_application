const { Client } = require('pg');

async function init() {
    // Подключаемся к postgres для создания базы данных
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: '1234',
        port: 5432
    });

    try {
        await client.connect();
        
        // Проверяем существование базы данных
        const res = await client.query(
            "SELECT datname FROM pg_database WHERE datname = 'mall_db'"
        );

        if (res.rows.length > 0) {
            // Закрываем все подключения к базе данных
            await client.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = 'mall_db'
                AND pid <> pg_backend_pid();
            `);
            
            // Удаляем существующую базу данных
            await client.query('DROP DATABASE mall_db');
        }

        // Создаем новую базу данных
        await client.query('CREATE DATABASE mall_db WITH ENCODING = UTF8');
        console.log('База данных mall_db создана успешно');

    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Устанавливаем переменные окружения
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = '1234';
process.env.PGHOST = 'localhost';
process.env.PGPORT = '5432';

init(); 