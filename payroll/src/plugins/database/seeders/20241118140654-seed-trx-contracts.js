'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const contracts = [];
    
    // Create contracts for all 25 employees
    for (let i = 1; i <= 25; i++) {
      const startDate = new Date();
      let endDate;
      
      // Alternate between contract types and durations
      if (i % 2 === 0) {
        // Contract type 2 - shorter duration (6 months)
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
        
        contracts.push({
          id: `${i}`,
          employee_id: `${i}`,
          contract_type_id: '2',
          start_date: startDate,
          end_date: endDate,
          deleted: 0,
          created_by: 'system',
          updated_by: 'system',
          created_at: new Date(),
          updated_at: new Date()
        });
      } else {
        // Contract type 1 - longer duration (1-2 years)
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + faker.number.int({ min: 1, max: 2 }));
        
        contracts.push({
          id: `${i}`,
          employee_id: `${i}`,
          contract_type_id: '1',
          start_date: startDate,
          end_date: endDate,
          deleted: 0,
          created_by: 'system',
          updated_by: 'system',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('trx_contracts', contracts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('trx_contracts', null, {});
  }
};