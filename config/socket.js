module.exports = function(io) {
    // Хранение активных пользователей
    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('Новое подключение к Socket.IO');

        // Авторизация пользователя
        socket.on('auth', (userId) => {
            activeUsers.set(socket.id, userId);
            socket.join(`user_${userId}`);
            io.emit('userOnline', userId);
        });

        // Присоединение к чату с администрацией
        socket.on('joinAdminChat', (userId) => {
            socket.join(`admin_chat_${userId}`);
        });

        // Отправка сообщения
        socket.on('sendMessage', async (data) => {
            const { message, recipientId, senderId } = data;
            
            // Сохранение сообщения в БД можно добавить здесь

            io.to(`admin_chat_${recipientId}`).emit('newMessage', {
                message,
                senderId,
                timestamp: new Date()
            });
        });

        // Отправка уведомления
        socket.on('sendNotification', (data) => {
            const { userId, notification } = data;
            io.to(`user_${userId}`).emit('notification', notification);
        });

        // Обработка отключения
        socket.on('disconnect', () => {
            const userId = activeUsers.get(socket.id);
            if (userId) {
                io.emit('userOffline', userId);
                activeUsers.delete(socket.id);
            }
        });
    });
}; 