'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mst_positions', [
      { id: '1', tenant_id: '1', department_id: '1', name: 'Software Engineer', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() },
      { id: '2', tenant_id: '1', department_id: '2', name: 'HR Manager', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mst_positions', null, {});
  }
};
