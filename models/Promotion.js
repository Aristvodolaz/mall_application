const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Promotion extends Model {}

Promotion.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shops',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed', 'bogo'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    min_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    max_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    terms_conditions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    promo_code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Promotion',
    tableName: 'promotions',
    timestamps: true,
    hooks: {
        beforeCreate: async (promotion) => {
            // Проверка дат
            if (promotion.end_date <= promotion.start_date) {
                throw new Error('Дата окончания должна быть позже даты начала');
            }
            
            // Генерация промокода, если не указан
            if (!promotion.promo_code) {
                promotion.promo_code = Math.random().toString(36).substring(2, 8).toUpperCase();
            }
        }
    }
});

module.exports = Promotion; 