const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Создает конфигурацию multer для загрузки файлов
 * @param {string} directory - Директория для загрузки
 * @param {string} prefix - Префикс для имени файла
 * @param {number} maxSize - Максимальный размер файла в байтах
 * @param {RegExp} allowedTypes - Регулярное выражение для разрешенных типов файлов
 * @returns {multer.Multer} Настроенный экземпляр multer
 */
function createUploader(directory, prefix, maxSize, allowedTypes) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join('public', directory);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: maxSize
        },
        fileFilter: (req, file, cb) => {
            const mimetype = allowedTypes.test(file.mimetype);
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
                return cb(null, true);
            }
            cb(new Error('Недопустимый тип файла'));
        }
    });
}

// Конфигурация для загрузки аватаров
const avatarUploader = createUploader(
    'uploads/avatars',
    'avatar',
    5 * 1024 * 1024, // 5MB
    /jpeg|jpg|png|gif/
);

module.exports = {
    createUploader,
    avatarUploader
}; 