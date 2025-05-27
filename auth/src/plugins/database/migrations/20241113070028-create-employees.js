'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mst_employees', {
      id: {
         type: Sequelize.STRING,
         primaryKey: true,
         allowNull: false
       },
      employee_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nik: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      marital_status_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_marital_statuses',
          key: 'id'
        }
      },
      npwp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emergency_contact: {
        type: Sequelize.STRING,
        allowNull: true
      },
      position_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_positions',
          key: 'id'
        }
      },
      department_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_departments',
          key: 'id'
        }
      },
      manager_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supervisor_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      team_lead_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mentor_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tenant_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_tenants',
          key: 'id'
        }
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
    await queryInterface.dropTable('mst_employees');
  }
};