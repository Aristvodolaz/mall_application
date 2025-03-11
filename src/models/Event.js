module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        time: {
            type: DataTypes.STRING
        },
        category: {
            type: DataTypes.STRING
        },
        image: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        }
    }, {
        tableName: 'events',
        underscored: true
    });

    return Event;
}; 