module.exports = {
    development: {
        port: 3002,
        database: {
            host: 'localhost',
            port: 5432,
            name: 'mall_db',
            user: 'postgres',
            password: 'postgres'
        },
        session: {
            secret: 'your-secret-key',
            resave: false,
            saveUninitialized: false
        }
    },
    production: {
        port: process.env.PORT || 3002,
        database: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            name: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        },
        session: {
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }
    }
}; 