'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mst_positions', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'mst_tenants',
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
      name: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('mst_positions');
  }
};