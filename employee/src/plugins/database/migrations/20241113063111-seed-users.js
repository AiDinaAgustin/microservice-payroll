'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('mst_tenants', [
      {
        id: '1',
        name: 'Bigio',
        email: 'bigio@example.com',
        status: 1,
        deleted: 0,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('sys_roles', [
      {
        id: '1',
        tenant_id: '1',
        name: 'Admin',
        deleted: 0,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        tenant_id: '1',
        name: 'User',
        deleted: 0,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // await queryInterface.bulkInsert('sys_permissions', [
    //   {
    //     id: '1',
    //     name: 'Read',
    //     parent_id: null,
    //     type: 'aksi',
    //     deleted: 0,
    //     created_by: 'system',
    //     updated_by: 'system',
    //     created_at: new Date(),
    //     updated_at: new Date()
    //   },
    //   {
    //     id: '2',
    //     name: 'Employee Management',
    //     parent_id: null,
    //     type: 'menu',
    //     deleted: 0,
    //     created_by: 'system',
    //     updated_by: 'system',
    //     created_at: new Date(),
    //     updated_at: new Date()
    //   }
    // ], {});

    // await queryInterface.bulkInsert('sys_role_permissions', [
    //   {
    //     id: '1',
    //     tenant_id: '1',
    //     role_id: '1',
    //     permission_id: '1',
    //     deleted: 0,
    //     created_by: 'system',
    //     updated_by: 'system',
    //     created_at: new Date(),
    //     updated_at: new Date()
    //   },
    //   {
    //     id: '2',
    //     tenant_id: '1',
    //     role_id: '2',
    //     permission_id: '2',
    //     deleted: 0,
    //     created_by: 'system',
    //     updated_by: 'system',
    //     created_at: new Date(),
    //     updated_at: new Date()
    //   }
    // ], {});

    await queryInterface.bulkInsert('sys_users', [
      {
        id: '1',
        tenant_id: '1',
        role_id: '1',
        username: 'admin@example.com',
        password: 'password',
        last_login: new Date(),
        employee_id: '',
        deleted: 0,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '2',
        tenant_id: '1',
        role_id: '2',
        username: 'user@example.com',
        password: 'password',
        last_login: new Date(),
        employee_id: '1',
        deleted: 0,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sys_users', null, {});
    await queryInterface.bulkDelete('sys_role_permissions', null, {});
    await queryInterface.bulkDelete('sys_permissions', null, {});
    await queryInterface.bulkDelete('sys_roles', null, {});
    await queryInterface.bulkDelete('mst_tenants', null, {});
  }
};