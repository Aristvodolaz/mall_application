const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Shop extends Model {}

Shop.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    full_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    floor: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    working_hours: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
    },
    reviews_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    main_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    coordinates: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    social_media: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Shop',
    tableName: 'shops',
    timestamps: true
});

module.exports = Shop; 