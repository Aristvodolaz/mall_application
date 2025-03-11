const { Model, DataTypes } = require('sequelize');
const QRCode = require('qrcode');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    class CinemaTicket extends Model {
        // Метод для генерации QR-кода
        async generateQRCode() {
            const ticketData = {
                id: this.id,
                screening_id: this.screening_id,
                seats: this.seats,
                code: this.code
            };
            
            try {
                const qrCode = await QRCode.toDataURL(JSON.stringify(ticketData));
                await this.update({ qr_code: qrCode });
            } catch (error) {
                console.error('Ошибка при генерации QR-кода:', error);
            }
        }

        // Метод для генерации уникального кода билета
        generateTicketCode() {
            const code = crypto.randomBytes(8).toString('hex').toUpperCase();
            this.code = code;
        }
    }

    CinemaTicket.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        screening_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'screenings',
                key: 'id'
            }
        },
        seats: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                isValidSeats(value) {
                    if (!Array.isArray(value) || !value.length) {
                        throw new Error('Неверный формат списка мест');
                    }
                    value.forEach(seat => {
                        if (!seat.row || !seat.seat || !seat.type || !seat.price) {
                            throw new Error('Неверный формат места');
                        }
                        if (!['standard', 'vip', 'student', 'child'].includes(seat.type)) {
                            throw new Error('Неверный тип места');
                        }
                        if (seat.price <= 0) {
                            throw new Error('Неверная цена места');
                        }
                    });
                }
            }
        },
        total_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        payment_status: {
            type: DataTypes.STRING(20),
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'paid', 'cancelled']]
            }
        },
        code: {
            type: DataTypes.STRING(20),
            unique: true
        },
        qr_code: {
            type: DataTypes.TEXT
        },
        expires_at: {
            type: DataTypes.DATE
        },
        is_used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'CinemaTicket',
        tableName: 'cinema_tickets',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (ticket) => {
                // Генерируем код билета
                ticket.generateTicketCode();
                
                // Устанавливаем срок действия (15 минут для оплаты)
                ticket.expires_at = new Date(Date.now() + 15 * 60 * 1000);
            },
            afterCreate: async (ticket) => {
                // Генерируем QR-код после создания билета, если он оплачен
                if (ticket.payment_status === 'paid') {
                    await ticket.generateQRCode();
                }
            },
            afterUpdate: async (ticket) => {
                // Генерируем QR-код при изменении статуса на "оплачен"
                if (ticket.changed('payment_status') && ticket.payment_status === 'paid') {
                    await ticket.generateQRCode();
                }
            }
        },
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['screening_id']
            },
            {
                fields: ['code'],
                unique: true
            }
        ]
    });

    return CinemaTicket;
}; 