'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Предполагается, что у нас есть пользователи с ID 1 (админ) и 2 (обычный пользователь)
    const now = new Date();
    
    await queryInterface.bulkInsert('chat_messages', [
      {
        senderId: 2, // Обычный пользователь
        recipientId: 1, // Админ
        message: 'Здравствуйте! У меня есть вопрос о часах работы кинотеатра.',
        isRead: true,
        createdAt: new Date(now.getTime() - 3600000 * 5), // 5 часов назад
        updatedAt: new Date(now.getTime() - 3600000 * 5)
      },
      {
        senderId: 1, // Админ
        recipientId: 2, // Обычный пользователь
        message: 'Добрый день! Кинотеатр работает с 10:00 до 22:00 ежедневно. Чем еще могу помочь?',
        isRead: true,
        createdAt: new Date(now.getTime() - 3600000 * 4.5), // 4.5 часа назад
        updatedAt: new Date(now.getTime() - 3600000 * 4.5)
      },
      {
        senderId: 2, // Обычный пользователь
        recipientId: 1, // Админ
        message: 'Спасибо за информацию! А как можно забронировать билеты заранее?',
        isRead: true,
        createdAt: new Date(now.getTime() - 3600000 * 4), // 4 часа назад
        updatedAt: new Date(now.getTime() - 3600000 * 4)
      },
      {
        senderId: 1, // Админ
        recipientId: 2, // Обычный пользователь
        message: 'Вы можете забронировать билеты онлайн на нашем сайте в разделе "Кинотеатр" или по телефону +7 (123) 456-78-90.',
        isRead: false,
        createdAt: new Date(now.getTime() - 3600000 * 3.5), // 3.5 часа назад
        updatedAt: new Date(now.getTime() - 3600000 * 3.5)
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('chat_messages', null, {});
  }
}; 