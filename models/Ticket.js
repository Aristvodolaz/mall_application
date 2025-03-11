const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Ticket extends Model {}

Ticket.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'events',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qr_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    seat_info: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    used_bonus_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    earned_bonus_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    additional_info: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    timestamps: true,
    hooks: {
        afterCreate: async (ticket) => {
            // Обновление количества доступных билетов
            const event = await ticket.getEvent();
            await event.decrement('available_tickets', { by: ticket.quantity });
            
            // Начисление бонусных баллов
            if (ticket.status === 'paid') {
                const user = await ticket.getUser();
                const bonusPoints = Math.floor(ticket.total_price * 0.1); // 10% от стоимости
                await user.increment('bonus_points', { by: bonusPoints });
                await ticket.update({ earned_bonus_points: bonusPoints });
            }
        }
    }
});

module.exports = Ticket; 