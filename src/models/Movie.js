const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Movie extends Model {
        static associate(models) {
            Movie.hasMany(models.Screening, {
                foreignKey: 'movie_id',
                as: 'screenings'
            });
            Movie.hasMany(models.MovieReview, {
                foreignKey: 'movie_id',
                as: 'reviews'
            });
        }
    }

    Movie.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        original_title: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        poster_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: true
            }
        },
        trailer_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: true
            }
        },
        rating: {
            type: DataTypes.DECIMAL(3, 1),
            validate: {
                min: 0,
                max: 10
            }
        },
        genre: {
            type: DataTypes.STRING(100)
        },
        director: {
            type: DataTypes.STRING
        },
        cast: {
            type: DataTypes.TEXT
        },
        age_rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 18
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Movie',
        tableName: 'movies',
        timestamps: true,
        underscored: true
    });

    return Movie;
}; 