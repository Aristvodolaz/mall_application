const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gallery: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_tickets: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available_tickets: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    organizer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    contact_phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    additional_info: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
    hooks: {
        beforeCreate: async (event) => {
            event.available_tickets = event.total_tickets;
        }
    }
});

module.exports = Event; 