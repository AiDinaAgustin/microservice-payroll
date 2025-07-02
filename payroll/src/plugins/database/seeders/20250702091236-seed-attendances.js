'use strict';

const { v4: uuidv4 } = require('uuid');

function getWorkingDays(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) { // Monday–Friday
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const attendances = [];
    const months = [
      { year: 2025, month: 5 }, // June (0-based)
      { year: 2025, month: 6 }, // July
      { year: 2025, month: 7 }  // August
    ];
    for (let empId = 1; empId <= 25; empId++) {
      for (const { year, month } of months) {
        const days = getWorkingDays(year, month);
        for (const day of days) {
          // Randomize status
          let status = 'present';
          let check_in = new Date(day);
          let late_minutes = 0;
          const rand = Math.random();
          if (rand < 0.1) {
            status = 'absent';
            check_in = null;
          } else if (rand < 0.15) {
            status = 'leave';
            check_in = null;
          } else {
            // Randomize check_in time between 07:30 and 08:30
            const hour = 7 + Math.floor(Math.random() * 2); // 7 or 8
            const minute = Math.floor(Math.random() * 60);
            check_in.setHours(hour, minute, 0, 0);
            if (hour > 8 || (hour === 8 && minute > 0)) {
              status = 'late';
              late_minutes = (hour - 8) * 60 + minute;
            } else if (hour === 8 && minute > 0) {
              status = 'late';
              late_minutes = minute;
            }
          }
          let check_out = null;
          if (check_in) {
            check_out = new Date(day);
            check_out.setHours(16, 0, 0, 0); // jam 16:00:00
          }
          attendances.push({
            id: uuidv4(),
            employee_id: `${empId}`,            
            tenant_id: '1',
            date: day,
            status,
            check_in,
            check_out,
            late_minutes,
            deleted: false,
            created_by: null,
            updated_by: null,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }
    await queryInterface.bulkInsert('payroll_attendances', attendances, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payroll_attendances', null, {});
  }
};