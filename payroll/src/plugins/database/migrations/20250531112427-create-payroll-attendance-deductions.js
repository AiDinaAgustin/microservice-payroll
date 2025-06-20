'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payroll_attendance_deductions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
        type: Sequelize.STRING,
        allowNull: false
      },
      total_late_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      deduction_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
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
    
    // Add indexes for performance
    await queryInterface.addIndex('payroll_attendance_deductions', ['employee_id']);
    await queryInterface.addIndex('payroll_attendance_deductions', ['tenant_id']);
    await queryInterface.addIndex('payroll_attendance_deductions', ['period']);
    await queryInterface.addIndex('payroll_attendance_deductions', ['deleted']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payroll_attendance_deductions');
  }
};