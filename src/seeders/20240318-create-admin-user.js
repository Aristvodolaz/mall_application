'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('users', [{
      username: 'admin',
      email: 'admin@mall.com',
      password_hash: passwordHash,
      role: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@mall.com' }, {});
  }
}; 