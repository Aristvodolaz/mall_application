module.exports = (sequelize, DataTypes) => {
    const Shop = sequelize.define('Shop', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.STRING
        },
        floor: {
            type: DataTypes.INTEGER
        },
        opening_hours: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        image_url: {
            type: DataTypes.STRING
        },
        logo_url: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'shops',
        underscored: true
    });

    return Shop;
}; 