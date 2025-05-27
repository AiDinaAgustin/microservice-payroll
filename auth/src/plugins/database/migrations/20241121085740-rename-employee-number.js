'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('mst_employees', 'employee_number', 'employee_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('mst_employees', 'employee_id', 'employee_number');
  }
};