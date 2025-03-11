const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Создание таблицы пользователей
        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'),
                defaultValue: 'user'
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            avatar: {
                type: DataTypes.STRING,
                allowNull: true
            },
            bonus_points: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            last_login: {
                type: DataTypes.DATE,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание таблицы магазинов
        await queryInterface.createTable('shops', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            full_description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            floor: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true
            },
            working_hours: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            rating: {
                type: DataTypes.DECIMAL(3, 2),
                defaultValue: 0
            },
            reviews_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            main_image: {
                type: DataTypes.STRING,
                allowNull: true
            },
            coordinates: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            social_media: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание таблицы событий
        await queryInterface.createTable('events', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: true
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true
            },
            gallery: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                defaultValue: []
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            total_tickets: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            available_tickets: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            is_featured: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            organizer: {
                type: DataTypes.STRING,
                allowNull: true
            },
            contact_email: {
                type: DataTypes.STRING,
                allowNull: true
            },
            contact_phone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            additional_info: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание таблицы билетов
        await queryInterface.createTable('tickets', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            event_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'events',
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
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
                defaultValue: 'pending'
            },
            payment_id: {
                type: DataTypes.STRING,
                allowNull: true
            },
            payment_method: {
                type: DataTypes.STRING,
                allowNull: true
            },
            qr_code: {
                type: DataTypes.STRING,
                allowNull: true
            },
            seat_info: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            used_bonus_points: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            earned_bonus_points: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            is_used: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            used_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            additional_info: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание таблицы отзывов
        await queryInterface.createTable('reviews', {
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
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание таблицы акций
        await queryInterface.createTable('promotions', {
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
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            image_url: {
                type: DataTypes.STRING,
                allowNull: true
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
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            max_discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            usage_limit: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            used_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            terms_conditions: {
                type: DataTypes.TEXT,
                allowNull: true
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
                allowNull: true,
                unique: true
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Создание индексов
        await queryInterface.addIndex('shops', ['category']);
        await queryInterface.addIndex('shops', ['floor']);
        await queryInterface.addIndex('events', ['date']);
        await queryInterface.addIndex('events', ['category']);
        await queryInterface.addIndex('tickets', ['event_id']);
        await queryInterface.addIndex('tickets', ['user_id']);
        await queryInterface.addIndex('reviews', ['shop_id']);
        await queryInterface.addIndex('reviews', ['user_id']);
        await queryInterface.addIndex('promotions', ['shop_id']);
        await queryInterface.addIndex('promotions', ['start_date', 'end_date']);
    },

    down: async (queryInterface, Sequelize) => {
        // Удаление таблиц в обратном порядке
        await queryInterface.dropTable('promotions');
        await queryInterface.dropTable('reviews');
        await queryInterface.dropTable('tickets');
        await queryInterface.dropTable('events');
        await queryInterface.dropTable('shops');
        await queryInterface.dropTable('users');
    }
}; 