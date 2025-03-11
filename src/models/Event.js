const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        static associate(models) {
            // Определите здесь связи с другими моделями, если они есть
        }
    }

    Event.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        date: DataTypes.DATE,
        time: DataTypes.STRING,
        location: DataTypes.STRING,
        image: DataTypes.STRING,
    
    }, {
        sequelize,
        modelName: 'Event',
        tableName: 'events',
        underscored: true,
        timestamps: true
    });

    return Event;
}; 