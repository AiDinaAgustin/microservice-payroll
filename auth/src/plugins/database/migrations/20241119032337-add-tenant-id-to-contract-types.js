'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mst_contract_types', 'tenant_id', {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: 'mst_tenants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mst_contract_types', 'tenant_id');
  }
};