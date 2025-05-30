'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mst_marital_statuses', [
      { id: '1', status: 'Single', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() },
      { id: '2', status: 'Married', deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mst_marital_statuses', null, {});
  }
};
