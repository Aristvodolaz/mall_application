const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Promotion extends Model {
        static associate(models) {
            Promotion.belongsTo(models.Shop, {
                foreignKey: 'shop_id',
                as: 'shop'
            });
        }
    }

    Promotion.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        shop_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'shops',
                key: 'id'
            }
        },
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        discount_value: DataTypes.INTEGER,
        image_url: DataTypes.STRING,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Promotion',
        tableName: 'promotions',
        underscored: true,
        timestamps: true
    });

    return Promotion;
}; 