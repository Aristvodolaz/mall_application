module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('Ticket', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'events',
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
            type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
            defaultValue: 'pending'
        }
    }, {
        tableName: 'tickets',
        underscored: true
    });

    return Ticket;
}; 