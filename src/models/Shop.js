const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    console.log('Инициализация модели Shop...');
    
    class Shop extends Model {
        static associate(models) {
            console.log('Настройка ассоциаций для модели Shop...');
            console.log('Доступные модели:', Object.keys(models));
            
            Shop.hasMany(models.Promotion, {
                foreignKey: 'shop_id',
                as: 'promotions'
            });
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
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        category: DataTypes.STRING,
        floor: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1
            }
        },
        opening_hours: DataTypes.STRING,
        phone: DataTypes.STRING,
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        logo_url: DataTypes.STRING,
       
    }, {
        sequelize,
        modelName: 'Shop',
        tableName: 'shops',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    console.log('Модель Shop успешно инициализирована');
    return Shop;
}; 