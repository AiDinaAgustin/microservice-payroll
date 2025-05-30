'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payroll_payslips', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'mst_employees',
          key: 'id'
        }
      },
      tenant_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      period: {
        type: Sequelize.DATE,
        allowNull: false
      },
      base_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      total_deductions: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      net_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payroll_payslips');
  }
};