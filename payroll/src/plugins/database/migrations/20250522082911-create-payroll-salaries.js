'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payroll_salaries', {
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
      base_salary: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      allowances: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      period: {
        type: Sequelize.DATE,
        allowNull: false
      },
      effective_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'active'
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
    await queryInterface.dropTable('payroll_salaries');
  }
};