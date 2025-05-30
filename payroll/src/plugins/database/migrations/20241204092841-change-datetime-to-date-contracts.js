'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('trx_contracts', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
    await queryInterface.changeColumn('trx_contracts', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('trx_contracts', 'start_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('trx_contracts', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};