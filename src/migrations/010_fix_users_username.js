const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Создаем временную таблицу для users
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS users_temp AS SELECT * FROM users;
    `);

    // Удаляем таблицу users
    await queryInterface.dropTable('users');

    // Создаем таблицу users заново
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Восстанавливаем данные в таблице users
    await queryInterface.sequelize.query(`
      INSERT INTO users (email, username, password, role, is_active)
      SELECT 
        email,
        SPLIT_PART(email, '@', 1) as username,
        password,
        'user' as role,
        true as is_active
      FROM users_temp;
    `);

    // Восстанавливаем последовательность
    await queryInterface.sequelize.query(`
      SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
    `);

    // Удаляем временную таблицу
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS users_temp;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
    
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      avatar_url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  }
}; 