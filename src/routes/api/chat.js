const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const ChatMessage = require('../../models/ChatMessage');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// Получить историю сообщений
router.get('/messages/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.session.user.id;
        
        // Получаем сообщения между текущим пользователем и указанным пользователем
        const messages = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: currentUserId, recipientId: userId },
                    { senderId: userId, recipientId: currentUserId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'avatar_url']
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'username', 'avatar_url']
                }
            ],
            order: [['created_at', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).json({ error: 'Ошибка при получении сообщений' });
    }
});

// Отправить сообщение
router.post('/messages', auth, async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.session.user.id;

        // Проверяем существование получателя
        const recipient = await User.findByPk(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Получатель не найден' });
        }

        // Создаем сообщение
        const message = await ChatMessage.create({
            senderId,
            recipientId,
            content,
            created_at: new Date()
        });

        // Получаем полное сообщение с информацией о пользователях
        const fullMessage = await ChatMessage.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'avatar_url']
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'username', 'avatar_url']
                }
            ]
        });

        // Отправляем событие через Socket.IO
        req.app.get('io').to(`user-${recipientId}`).emit('new-message', fullMessage);

        res.json(fullMessage);
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ error: 'Ошибка при отправке сообщения' });
    }
});

// Получить список чатов
router.get('/chats', auth, async (req, res) => {
    try {
        const currentUserId = req.session.user.id;

        // Получаем последние сообщения для каждого чата
        const chats = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: currentUserId },
                    { recipientId: currentUserId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'avatar_url']
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'username', 'avatar_url']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Группируем сообщения по чатам
        const chatsByUser = {};
        chats.forEach(message => {
            const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;
            if (!chatsByUser[otherUserId]) {
                chatsByUser[otherUserId] = {
                    user: message.senderId === currentUserId ? message.recipient : message.sender,
                    lastMessage: message
                };
            }
        });

        res.json(Object.values(chatsByUser));
    } catch (error) {
        console.error('Ошибка при получении списка чатов:', error);
        res.status(500).json({ error: 'Ошибка при получении списка чатов' });
    }
});

module.exports = router; 