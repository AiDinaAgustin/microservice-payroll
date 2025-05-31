'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payroll_salaries', 'period', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payroll_salaries', 'period', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};