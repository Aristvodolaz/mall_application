const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    console.log('Инициализация модели Shop...');
    
    class Shop extends Model {
        static associate(models) {
            console.log('Настройка ассоциаций для модели Shop...');
            console.log('Доступные модели:', Object.keys(models));
            
            if (models.Review) {
                Shop.hasMany(models.Review, {
                    foreignKey: 'shop_id',
                    as: 'reviews'
                });
                console.log('Ассоциация с Review успешно настроена');
            } else {
                console.error('Модель Review не найдена при настройке ассоциаций');
            }
        }
    }

    Shop.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        floor: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1
            }
        },
        opening_hours: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        logo_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Shop',
        tableName: 'shops',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    console.log('Модель Shop успешно инициализирована');
    return Shop;
}; 