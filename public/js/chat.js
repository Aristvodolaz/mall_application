document.addEventListener('DOMContentLoaded', function() {
    // Элементы чата
    const chatIcon = document.getElementById('chatIcon');
    const chatOffcanvas = document.getElementById('chatOffcanvas');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const unreadBadge = document.getElementById('unreadMessages');
    
    // ID текущего пользователя (должен быть установлен на странице)
    const currentUserId = USER_ID; // Предполагается, что USER_ID определен в шаблоне
    
    // ID администратора (предполагается, что администратор имеет ID 1)
    const adminId = 1;
    
    // Инициализация Socket.IO
    const socket = io();
    
    // Присоединение к комнате чата
    socket.emit('join-chat', currentUserId);
    
    // Проверка непрочитанных сообщений при загрузке
    fetchUnreadMessages();
    
    // Открытие чата при клике на иконку
    if (chatIcon) {
        chatIcon.addEventListener('click', function() {
            const bsOffcanvas = new bootstrap.Offcanvas(chatOffcanvas);
            bsOffcanvas.show();
            resetUnreadCount();
            loadChatHistory();
        });
    }
    
    // Отправка сообщения
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = messageInput.value.trim();
            
            if (message) {
                sendMessage(message);
                messageInput.value = '';
            }
        });
    }
    
    // Получение новых сообщений
    socket.on('new-message', function(data) {
        addMessageToChat(data);
        
        // Если чат не открыт, увеличиваем счетчик непрочитанных
        if (!chatOffcanvas.classList.contains('show')) {
            incrementUnreadCount();
        }
    });
    
    // Функция для загрузки истории чата
    function loadChatHistory() {
        fetch(`/api/chat/messages/${adminId}`)
            .then(response => response.json())
            .then(messages => {
                chatMessages.innerHTML = '';
                messages.forEach(msg => {
                    addMessageToChat(msg);
                });
                // Прокрутка к последнему сообщению
                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => {
                console.error('Ошибка при загрузке истории чата:', error);
            });
    }
    
    // Функция для отправки сообщения
    function sendMessage(message) {
        fetch('/api/chat/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipientId: adminId,
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            addMessageToChat({
                senderId: currentUserId,
                message: message,
                createdAt: new Date()
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            console.error('Ошибка при отправке сообщения:', error);
        });
    }
    
    // Функция для добавления сообщения в чат
    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        const isSent = message.senderId === currentUserId;
        
        messageElement.className = `chat-message ${isSent ? 'sent' : 'received'}`;
        
        const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.message}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Функция для получения количества непрочитанных сообщений
    function fetchUnreadMessages() {
        fetch('/api/chat/unread')
            .then(response => response.json())
            .then(data => {
                if (data.count > 0) {
                    unreadBadge.textContent = data.count;
                    unreadBadge.style.display = 'block';
                } else {
                    unreadBadge.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Ошибка при получении непрочитанных сообщений:', error);
            });
    }
    
    // Функция для увеличения счетчика непрочитанных сообщений
    function incrementUnreadCount() {
        let count = parseInt(unreadBadge.textContent) || 0;
        count++;
        unreadBadge.textContent = count;
        unreadBadge.style.display = 'block';
    }
    
    // Функция для сброса счетчика непрочитанных сообщений
    function resetUnreadCount() {
        unreadBadge.textContent = '0';
        unreadBadge.style.display = 'none';
    }
}); 