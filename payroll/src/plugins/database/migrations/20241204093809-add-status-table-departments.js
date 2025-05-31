'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mst_departments', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: true,
      defaultValue: 'active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mst_departments', 'status');
    await queryInterface.sequelize.query('DROP TYPE "enum_mst_departments_status";');
  }
};