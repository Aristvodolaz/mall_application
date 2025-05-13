const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            Review.belongsTo(models.Shop, {
                foreignKey: 'shop_id',
                as: 'shop'
            });
        }
    }

    Review.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'shops',
                key: 'id'
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
        modelName: 'Review',
        tableName: 'reviews',
        underscored: true
    });

    return Review;
}; 