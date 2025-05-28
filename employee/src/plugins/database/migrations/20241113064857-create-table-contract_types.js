'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mst_contract_types', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_permanent: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('mst_contract_types');
  }
};