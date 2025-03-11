const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Review extends Model {}

Review.init({
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
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
        type: DataTypes.TEXT,
        allowNull: true
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    dislikes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_hidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reply_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    hooks: {
        afterCreate: async (review) => {
            // Обновление рейтинга магазина
            const shop = await review.getShop();
            const reviews = await shop.getReviews();
            
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRating / reviews.length;
            
            await shop.update({
                rating: parseFloat(averageRating.toFixed(2)),
                reviews_count: reviews.length
            });
        },
        afterDestroy: async (review) => {
            // Обновление рейтинга магазина после удаления отзыва
            const shop = await review.getShop();
            const reviews = await shop.getReviews();
            
            if (reviews.length === 0) {
                await shop.update({
                    rating: 0,
                    reviews_count: 0
                });
            } else {
                const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
                const averageRating = totalRating / reviews.length;
                
                await shop.update({
                    rating: parseFloat(averageRating.toFixed(2)),
                    reviews_count: reviews.length
                });
            }
        }
    }
});

module.exports = Review; 