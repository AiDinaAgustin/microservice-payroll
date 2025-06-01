'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mst_contract_types', [
      { id: '1', name: 'Full-Time', is_permanent: true, tenant_id: '1', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() },
      { id: '2', name: 'Part-Time', is_permanent: false, tenant_id: '1', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mst_contract_types', null, {});
  }
};
