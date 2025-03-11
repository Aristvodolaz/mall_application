const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MovieReview extends Model {
        static associate(models) {
            MovieReview.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'User'
            });
            MovieReview.belongsTo(models.Movie, {
                foreignKey: 'movieId',
                as: 'Movie'
            });
        }
    }

    MovieReview.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        movieId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Movies',
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