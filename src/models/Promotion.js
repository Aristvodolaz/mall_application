module.exports = (sequelize, DataTypes) => {
    const Promotion = sequelize.define('Promotion', {
        shop_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'shops',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        image_url: {
            type: DataTypes.STRING
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed', 'bogo'),
            allowNull: false
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        min_purchase: {
            type: DataTypes.DECIMAL(10, 2)
        },
        max_discount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        usage_limit: {
            type: DataTypes.INTEGER
        },
        used_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        terms_conditions: {
            type: DataTypes.TEXT
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        promo_code: {
            type: DataTypes.STRING,
            unique: true
        },
        category: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'promotions',
        underscored: true
    });

    return Promotion;
}; 