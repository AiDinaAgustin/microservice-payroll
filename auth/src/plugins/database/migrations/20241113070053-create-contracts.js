'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trx_contracts', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_employees',
          key: 'id'
        }
      },
      contract_type_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_contract_types',
          key: 'id'
        }
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('trx_contracts');
  }
};