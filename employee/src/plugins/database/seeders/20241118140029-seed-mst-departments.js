'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mst_departments', [
      { id: '1', tenant_id: '1', name: 'IT', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() },
      { id: '2', tenant_id: '1', name: 'HR', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mst_departments', null, {});
  }
};
