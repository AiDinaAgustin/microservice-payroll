'use strict';

const { v4: uuidv4 } = require('uuid');

const permissionDummyData = [
  {
     id: '621dc13a-40bd-411e-bb8f-9317782e23aa',
     code: 'dashboard',
     name: 'Dashboard',
     parent_id: null,
     type: 'menu',
     submenus: [
        {
           id: '43286d2a-e1d8-4926-88ce-efb924a58d77',
           code: 'dashboard.insight',
           name: 'Insight',
           parent_id: '621dc13a-40bd-411e-bb8f-9317782e23aa',
           type: 'action',
           endpoint: '/dashboards/insight'
        },
        {
           id: '6e5deaff-23a2-4c7b-aa2d-c0f7a5f02d00',
           code: 'dashboard.whats_on_today',
           name: "What's On Today",
           parent_id: '621dc13a-40bd-411e-bb8f-9317782e23aa',
           type: 'action',
           endpoint: '/dashboards/whatsontoday'
        },
        {
           id: 'd397bde2-16b7-4c86-be4d-d4b863c711a9',
           code: 'dashboard.upcoming_contract_endings',
           name: 'Upcoming Contract Endings',
           parent_id: '621dc13a-40bd-411e-bb8f-9317782e23aa',
           type: 'action',
           endpoint: '/dashboards/contract-end'
        }
     ]
  },
  {
     id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
     code: 'employee',
     name: 'Employee Directory',
     parent_id: null,
     type: 'menu',
     submenus: [
        {
           id: '864b1161-877d-457d-b255-005c5ccc515a',
           code: 'employee.list',
           name: 'Employee List',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/list'
        },
        {
           id: 'aa245635-b43b-40b8-9059-14dae5d2e99d',
           code: 'employee.add',
           name: 'Employee Add',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/add'
        },
        {
           id: 'e6900994-f31a-42bd-8596-dc29d024ebd1',
           code: 'employee.detail',
           name: 'Employee Detail',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/detail/:id'
        },
        {
           id: 'f98a993f-14fe-4948-99b0-2a64e2cc59f1',
           code: 'employee.edit',
           name: 'Employee Edit',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/edit/:id'
        },
        {
           id: '27368a27-5a1d-4f6e-b671-885cc5685224',
           code: 'employee.delete',
           name: 'Employee Delete',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/delete/:id'
        },
        {
           id: '7f040e9e-2992-4c80-a0f5-e84814afa619',
           code: 'employee.import',
           name: 'Employee Import',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/upload'
        },
        {
           id: '20fdba29-3f4d-4f62-b1bb-a4a03ff5ddcc',
           code: 'employee.download',
           name: 'Employee Download Template',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/download'
        },
        {
           id: '78a2762f-361e-4732-8645-0790698ad61e',
           code: 'employee.options',
           name: 'Employee Options',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/options'
        },
        {
           id: 'f2e1b0d1-1780-44db-9e92-766c9ee5d49b',
           code: 'employee.upload.image',
           name: 'Employee Upload Image',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/image/upload_profile'
        },
        {
            id: '6eb1f9e1-f1bb-4aa5-8a3a-ef8145ee9cf4',
            code: 'employee.get.image',
            name: 'Employee Get Image',
            parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
            type: 'action',
            endpoint: '/image/:imageName'
        },
        {
           id: '7eb41be6-e870-4c8f-802c-eeb79839b002',
           code: 'employee.patch.status',
           name: 'Employee Patch Status',
           parent_id: '1bd2a0d1-1780-44db-9e92-766c9ee5d49b',
           type: 'action',
           endpoint: '/employees/patch/:id'
        }
     ]
  },
  {
     id: '3935ddc1-6eb9-4343-a33d-efc348a6e513',
     code: 'general_setting',
     name: 'General Setting',
     parent_id: null,
     type: 'menu',
     submenus: [
        {
           id: '68ed7735-72dc-444c-9bfa-ae5c913fc67e',
           code: 'organization_management',
           name: 'Organization Management',
           parent_id: '3935ddc1-6eb9-4343-a33d-efc348a6e513',
           type: 'menu',
           submenus: [
              {
                 id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                 code: 'department',
                 name: 'Department',
                 parent_id: '68ed7735-72dc-444c-9bfa-ae5c913fc67e',
                 type: 'menu',
                 submenus: [
                    {
                       id: '5f524d95-fba7-4b87-a718-337cc15900f1',
                       code: 'department.list',
                       name: 'Department List',
                       parent_id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                       type: 'action',
                       endpoint: '/departments/list'
                    },
                    {
                       id: 'a7d0d511-3d7c-4678-9964-4215881eddbb',
                       code: 'department.add',
                       name: 'Department Add',
                       parent_id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                       type: 'action',
                       endpoint: '/departments/add'
                    },
                    {
                       id: '47fe860b-0396-4469-9e6f-87e61b5e4c0e',
                       code: 'department.edit',
                       name: 'Department Edit',
                       parent_id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                       type: 'action',
                       endpoint: '/departments/edit/:id'
                    },
                    {
                       id: '4f1304a3-f495-471c-8fe5-cc7e2d47d60a',
                       code: 'department.delete',
                       name: 'Department Delete ',
                       parent_id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                       type: 'action',
                       endpoint: '/departments/delete/:id'
                    },
                    {
                       id: '4e869dde-9ee2-4bee-8a7d-a460d207ee85',
                       code: 'department.options',
                       name: 'Department Options ',
                       parent_id: '2dcd29d9-64bc-4be1-a708-e28efe4259fc',
                       type: 'action',
                       endpoint: '/departments/options'
                    }
                 ]
              },
              {
                 id: '69a02628-3439-429d-b820-373a9a605433',
                 code: 'position',
                 name: 'Position',
                 parent_id: '68ed7735-72dc-444c-9bfa-ae5c913fc67e',
                 type: 'menu',
                 submenus: [
                    {
                       id: '93f621a8-d241-4d62-b334-c040327e8ab9',
                       code: 'position.list',
                       name: 'Position List',
                       parent_id: '69a02628-3439-429d-b820-373a9a605433',
                       type: 'action',
                       endpoint: '/positions/list'
                    },
                    {
                       id: '20768ddc-fef9-47fb-b205-4fe45b65bdea',
                       code: 'position.add',
                       name: 'Position Add',
                       parent_id: '69a02628-3439-429d-b820-373a9a605433',
                       type: 'action',
                       endpoint: '/positions/add'
                    },
                    {
                       id: 'd304d538-7e61-4158-8250-32ddc408124f',
                       code: 'position.edit',
                       name: 'Position Edit',
                       parent_id: '69a02628-3439-429d-b820-373a9a605433',
                       type: 'action',
                       endpoint: '/positions/edit/:id'
                    },
                    {
                       id: '6433c538-a896-4655-8626-7a8ea1973124',
                       code: 'position.delete',
                       name: 'Position Delete ',
                       parent_id: '69a02628-3439-429d-b820-373a9a605433',
                       type: 'action',
                       endpoint: '/positions/delete/:id'
                    },
                    {
                       id: '6b7892d5-7eed-4897-852f-790be5fecd44',
                       code: 'position.options',
                       name: 'Position Options ',
                       parent_id: '69a02628-3439-429d-b820-373a9a605433',
                       type: 'action',
                       endpoint: '/positions/options'
                    }
                 ]
              }
           ]
        },
        {
           id: 'f38d704a-c762-4a8b-a1ba-f0f72c8f1bcf',
           code: 'contract_management',
           name: 'Contract Management',
           parent_id: '3935ddc1-6eb9-4343-a33d-efc348a6e513',
           type: 'menu',
           submenus: [
              {
                 id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                 code: 'contract_type',
                 name: 'Contract Type',
                 parent_id: 'f38d704a-c762-4a8b-a1ba-f0f72c8f1bcf',
                 type: 'menu',
                 submenus: [
                    {
                       id: '91ad074e-a876-4030-b83a-54afd7fc1bd0',
                       code: 'contract_type.list',
                       name: 'Contract Type List',
                       parent_id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                       type: 'action',
                       endpoint: '/contract-types/list'
                    },
                    {
                       id: '935c1a3e-effd-4ab1-b414-0aa77750cfcf',
                       code: 'contract_type.add',
                       name: 'Contract Type Add',
                       parent_id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                       type: 'action',
                       endpoint: '/contract-types/add'
                    },
                    {
                       id: 'deb4e990-8de0-4d7b-a396-fa095348916f',
                       code: 'contract_type.edit',
                       name: 'Contract Type Edit',
                       parent_id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                       type: 'action',
                       endpoint: '/contract-types/edit/:id'
                    },
                    {
                       id: '6242e34c-8996-4289-9ea3-53b459bed003',
                       code: 'contract_type.delete',
                       name: 'Contract Type Delete ',
                       parent_id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                       type: 'action',
                       endpoint: '/contract-types/delete/:id'
                    },
                    {
                       id: '563523da-45f9-423c-a1fb-51be3edab6db',
                       code: 'contract_type.options',
                       name: 'Contract Type Options ',
                       parent_id: 'd8545f3b-2ea1-4f53-8553-d69891968da8',
                       type: 'action',
                       endpoint: '/contract-types/options'
                    }
                 ]
              }
           ]
        }
     ]
  },
  {
     id: '94b423d5-4a3c-4af4-9c40-3c269d2693f0',
     code: 'marital.status.options',
     name: 'Marital Status Options',
     parent_id: null,
     type: 'action',
     endpoint: '/marital-status/options'
  },
  {
       id: 'd0f5f8d2-5d0e-4d5e-9f4e-3f5f8d5d0e5d',
       code: 'status.options',
       name: 'Status Options',
       parent_id: null,
       type: 'action',
       endpoint: '/statuses'
  },
  {
   id: '83cf04a2-3de1-429c-a0be-8fca4bdbff8f',
   code: 'payroll_management',
   name: 'Payroll Management',
   parent_id: null,
   type: 'menu',
   submenus: [
     {
       id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
       code: 'salary',
       name: 'Salary',
       parent_id: '83cf04a2-3de1-429c-a0be-8fca4bdbff8f',
       type: 'menu',
       submenus: [
         {
           id: '278d27e1-7d25-40e2-a844-9836bbf2943d',
           code: 'salary.add',
           name: 'Salary Add',
           parent_id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
           type: 'action',
           endpoint: '/salaries/add'
         },
         {
           id: '8ee6efbc-7a94-4a3f-b37f-fdc15d593ac9',
           code: 'salary.list',
           name: 'Salary List',
           parent_id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
           type: 'action',
           endpoint: '/salaries/list'
         },
         {
           id: '6d2edebf-6c76-4a17-b08f-d56b8db61dc9',
           code: 'salary.edit',
           name: 'Salary Edit',
           parent_id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
           type: 'action',
           endpoint: '/salaries/edit/:id'
         },
         {
           id: '2f15723e-2f2d-4384-8f9c-4d63fdc2b420',
           code: 'salary.delete',
           name: 'Salary Delete',
           parent_id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
           type: 'action',
           endpoint: '/salaries/delete/:id'
         },
         {
           id: '029c7883-db44-4743-aa90-bb4ef624cc8b',
           code: 'salary.detail',
           name: 'Salary Detail',
           parent_id: '6dc53c4d-3b87-421f-9c7c-8cfb493df6ec',
           type: 'action',
           endpoint: '/salaries/detail/:id'
         }
       ]
     },
     {
       id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
       code: 'attendance',
       name: 'Attendance',
       parent_id: '83cf04a2-3de1-429c-a0be-8fca4bdbff8f',
       type: 'menu',
       submenus: [
         {
           id: '3d75d5be-4a2b-40ee-902c-d9ee07e2a134',
           code: 'attendance.add',
           name: 'Attendance Add',
           parent_id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
           type: 'action',
           endpoint: '/attendances/add'
         },
         {
           id: '6941f1b7-1f86-4a0a-80fc-e743c9f4ffcd',
           code: 'attendance.list',
           name: 'Attendance List',
           parent_id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
           type: 'action',
           endpoint: '/attendances/list'
         },
         {
           id: 'de76d5ff-f03f-4e75-bd8a-c4dbf99c3cbf',
           code: 'attendance.edit',
           name: 'Attendance Edit',
           parent_id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
           type: 'action',
           endpoint: '/attendances/edit/:id'
         },
         {
           id: '14fc3079-34de-4d77-9448-4cd110ae0b9e',
           code: 'attendance.delete',
           name: 'Attendance Delete',
           parent_id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
           type: 'action',
           endpoint: '/attendances/delete/:id'
         },
         {
           id: 'bcdfa280-0832-4bad-81d4-a0ab56457166',
           code: 'attendance.detail',
           name: 'Attendance Detail',
           parent_id: '54e7b22f-f210-4a3e-bb93-b0d69d254c59',
           type: 'action',
           endpoint: '/attendances/detail/:id'
         }
       ]
     },
     {
       id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
       code: 'attendance_deduction',
       name: 'Attendance Deduction',
       parent_id: '83cf04a2-3de1-429c-a0be-8fca4bdbff8f',
       type: 'menu',
       submenus: [
         {
           id: '9031e61f-b863-411d-b6f8-e07e892f4b1a',
           code: 'attendance_deduction.generate',
           name: 'Attendance Deduction Generate',
           parent_id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
           type: 'action',
           endpoint: '/attendance-deductions/generate'
         },
         {
           id: '95f6744e-8b4e-4ab9-a4bb-13b90cf8df84',
           code: 'attendance_deduction.calculate',
           name: 'Attendance Deduction Calculate',
           parent_id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
           type: 'action',
           endpoint: '/attendance-deductions/calculate'
         },
         {
           id: 'ebc57748-1340-4eb6-85d1-13fa51c58a48',
           code: 'attendance_deduction.list',
           name: 'Attendance Deduction List',
           parent_id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
           type: 'action',
           endpoint: '/attendance-deductions/list'
         },
         {
           id: '004bc79d-fc14-4453-a510-0cba52025056',
           code: 'attendance_deduction.delete',
           name: 'Attendance Deduction Delete',
           parent_id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
           type: 'action',
           endpoint: '/attendance-deductions/delete/:id'
         },
         {
           id: '2a5c1913-1b6d-4db1-9eec-eac3702d6c95',
           code: 'attendance_deduction.detail',
           name: 'Attendance Deduction Detail',
           parent_id: 'a7865534-fb57-45d0-9c8a-41c51e59c2c3',
           type: 'action',
           endpoint: '/attendance-deductions/detail/:id'
         }
       ]
     },
     {
       id: 'e83ea5dc-1045-49c3-993c-f46b958bfb34',
       code: 'payslip',
       name: 'Payslip',
       parent_id: '83cf04a2-3de1-429c-a0be-8fca4bdbff8f',
       type: 'menu',
       submenus: [
         {
           id: 'f4c7b176-3c4e-453c-858f-b81d15713d15',
           code: 'payslip.add',
           name: 'Payslip Add',
           parent_id: 'e83ea5dc-1045-49c3-993c-f46b958bfb34',
           type: 'action',
           endpoint: '/payslips/add'
         },
         {
           id: 'b69a2bd3-2105-451a-8584-82d1e787cd6f',
           code: 'payslip.generate',
           name: 'Payslip Generate',
           parent_id: 'e83ea5dc-1045-49c3-993c-f46b958bfb34',
           type: 'action',
           endpoint: '/payslips/generate'
         },
         {
           id: 'ea29a8d7-e87f-43a6-baa0-d1c342b3b7eb',
           code: 'payslip.list',
           name: 'Payslip List',
           parent_id: 'e83ea5dc-1045-49c3-993c-f46b958bfb34',
           type: 'action',
           endpoint: '/payslips/list'
         },
         {
           id: 'cbfc0582-5cf9-41ae-b39f-4042f24500d0',
           code: 'payslip.detail',
           name: 'Payslip Detail',
           parent_id: 'e83ea5dc-1045-49c3-993c-f46b958bfb34',
           type: 'action',
           endpoint: '/payslips/detail/:id'
         }
       ]
     }
   ]
}   
]


const flattenPermissions = (permissions, parentId = null) => {
  const flatPermissions = [];

  permissions.forEach((permission) => {
    const { id, name, code, endpoint, type, submenus } = permission;

    flatPermissions.push({
      id: id || uuidv4(),
      name,
      code,
      endpoint: endpoint || null,
      parent_id: parentId,
      type,
      deleted: 0,
      created_by: 'system',
      updated_by: 'system',
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (submenus && submenus.length > 0) {
      flatPermissions.push(...flattenPermissions(submenus, id));
    }
  });

  return flatPermissions;
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const flatPermissions = flattenPermissions(permissionDummyData);
    await queryInterface.bulkInsert('sys_permissions', flatPermissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    const ids = permissionDummyData.map((perm) => perm.id);
    await queryInterface.bulkDelete('sys_permissions', { id: ids }, {});
  },
};
