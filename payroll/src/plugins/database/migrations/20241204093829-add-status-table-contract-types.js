'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mst_contract_types', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: true,
      defaultValue: 'active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mst_contract_types', 'status');
    await queryInterface.sequelize.query('DROP TYPE "enum_mst_contract_types_status";');
  }
};