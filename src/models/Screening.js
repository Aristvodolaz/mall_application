const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Screening extends Model {}

    Screening.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        movie_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'movies',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                isDate: true,
                isAfterToday(value) {
                    if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                        throw new Error('Дата сеанса не может быть в прошлом');
                    }
                }
            }
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        hall: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        is_3d: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_imax: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        base_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        vip_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        student_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        child_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0
            }
        },
        seats_layout: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                isValidLayout(value) {
                    if (!Array.isArray(value) || !value.length) {
                        throw new Error('Неверный формат схемы зала');
                    }
                    value.forEach(row => {
                        if (!Array.isArray(row) || !row.length) {
                            throw new Error('Неверный формат ряда в схеме зала');
                        }
                        row.forEach(seat => {
                            if (![0, 1, 2].includes(seat)) {
                                throw new Error('Неверное значение места в схеме зала');
                            }
                        });
                    });
                }
            }
        },
        booked_seats: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Screening',
        tableName: 'screenings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['movie_id']
            },
            {
                fields: ['date']
            }
        ]
    });

    return Screening;
}; 