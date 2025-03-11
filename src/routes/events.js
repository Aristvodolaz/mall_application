const express = require('express');
const router = express.Router();

// Получение списка событий
router.get('/', (req, res) => {
    res.json({ message: 'Список событий' });
});

// Получение конкретного события
router.get('/:id', (req, res) => {
    res.json({ message: `Информация о событии ${req.params.id}` });
});

module.exports = router; 