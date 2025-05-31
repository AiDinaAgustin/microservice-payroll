'use strict';

/** @type {import('sequelize-cli').Migration} */
// New migration file for changing payslip period column type
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payroll_payslips', 'period', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payroll_payslips', 'period', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
