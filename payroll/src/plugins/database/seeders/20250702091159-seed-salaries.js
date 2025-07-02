'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salaries = [];
    const salaryOptions = [5000000, 6000000, 7000000];
    const periods = [
      { period: '06-2025', effective_date: '2025-01-06' },
      { period: '07-2025', effective_date: '2025-01-07' },
      { period: '08-2025', effective_date: '2025-01-08' }
    ];
    for (let empId = 1; empId <= 25; empId++) {
      for (const p of periods) {
        const base_salary = salaryOptions[Math.floor(Math.random() * salaryOptions.length)];
        salaries.push({
          id: uuidv4(),
          employee_id: `${empId}`,          
          tenant_id: '1',
          base_salary,
          allowances: Math.floor(Math.random() * 1000000), // random allowance
          period: p.period,
          effective_date: p.effective_date,
          status: 'active',
          deleted: false,
          created_by: null,
          updated_by: null,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    await queryInterface.bulkInsert('payroll_salaries', salaries, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payroll_salaries', null, {});
  }
};