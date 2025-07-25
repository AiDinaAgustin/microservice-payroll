'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const employees = [];
    for (let i = 1; i <= 25; i++) {
      employees.push({
        id: `${i}`,
        employee_id: `EMP${i.toString().padStart(3, '0')}`,
        name: faker.person.fullName(),
        status: faker.helpers.arrayElement(['active', 'on leave']),
        nik: `320${faker.number.int({ min: 1000000000, max: 9999999999 })}`,
        email: faker.internet.email(),
        phone_number: faker.phone.number('0812########'),
        address: faker.location.streetAddress(),
        birth_date: faker.date.past({ years: 30 }),
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        marital_status_id: faker.helpers.arrayElement(['1', '2']),
        npwp: `NPWP${faker.number.int({ min: 100000, max: 999999 })}`,
        emergency_contact: faker.phone.number('0812########'),
        position_id: faker.helpers.arrayElement(['1', '2']),
        department_id: faker.helpers.arrayElement(['1', '2']),
        manager_id: null,
        supervisor_id: null,
        team_lead_id: null,
        mentor_id: null,
        tenant_id: '1',
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('mst_employees', employees, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mst_employees', null, {});
  }
};
