const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MovieReview extends Model {
        static associate(models) {
            MovieReview.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            MovieReview.belongsTo(models.Movie, {
                foreignKey: 'movie_id',
                as: 'movie'
            });
            
        }
    }

    MovieReview.init({
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
        movie_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'movies',
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'MovieReview',
        tableName: 'movie_reviews',
        timestamps: true,
        underscored: true
    });

    return MovieReview;
}; 