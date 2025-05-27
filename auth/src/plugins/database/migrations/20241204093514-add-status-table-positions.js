'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mst_positions', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: true,
      defaultValue: 'active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mst_positions', 'status');
    await queryInterface.sequelize.query('DROP TYPE "enum_mst_positions_status";');
  }
};