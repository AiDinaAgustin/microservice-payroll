'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('trx_contracts', [
      { id: '1', employee_id: '1', contract_type_id: '1', start_date: new Date(), end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() },
      { id: '2', employee_id: '2', contract_type_id: '2', start_date: new Date(), end_date: new Date(new Date().setMonth(new Date().getMonth() + 6)), deleted: 0, created_by: 'system', updated_by: 'system', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('trx_contracts', null, {});
  }
};
