import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { db } from '@config/database'
import Position from './Position'
// import Department from './Department'
// import MaritalStatus from './MaritalStatus'
// import Tenant from './Tenant'
import Contract from './Contract'
// import EmployeeRole from './EmployeeRoles'
import { v4 as uuidv4 } from 'uuid';

class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>> {
   declare id: CreationOptional<string>
   declare employee_id: CreationOptional<string>
   declare name: string
   declare status: CreationOptional<string>
   declare nik: CreationOptional<string>
   declare email: CreationOptional<string>
   declare phone_number: CreationOptional<string>
   declare address: CreationOptional<string>
   declare birth_date: CreationOptional<Date>
   declare gender: CreationOptional<string>
   declare marital_status_id: CreationOptional<string>
   declare npwp: CreationOptional<string>
   declare emergency_contact: CreationOptional<string>
   declare position_id: CreationOptional<string>
   declare department_id: CreationOptional<string>
   declare manager_id: CreationOptional<string>
   declare supervisor_id: CreationOptional<string>
   declare team_lead_id: CreationOptional<string>
   declare mentor_id: CreationOptional<string>
   declare tenant_id: CreationOptional<string>
   declare image_url: CreationOptional<string>
   declare medical_condition: CreationOptional<Text>
   declare deleted: CreationOptional<number>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
   declare readonly position?: Position;
   declare readonly contracts?: Contract[];
}

Employee.init(
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: uuidv4,
         primaryKey: true,
         allowNull: false
      },
      employee_id: {
         type: DataTypes.STRING,
         unique: true,
         field: 'employee_id',
         allowNull: true
      },
      name: {
         type: DataTypes.STRING,
         allowNull: true
      },
      status: {
         type: DataTypes.STRING,
         allowNull: true
      },
      nik: {
         type: DataTypes.STRING,
         allowNull: true
      },
      email: {
         type: DataTypes.STRING,
         allowNull: true
      },
      phone_number: {
         type: DataTypes.STRING,
         allowNull: true
      },
      address: {
         type: DataTypes.STRING,
         allowNull: true
      },
      birth_date: {
         type: DataTypes.DATEONLY,
         allowNull: true
      },
      gender: {
         type: DataTypes.STRING,
         allowNull: true
      },
      marital_status_id: {
         type: DataTypes.STRING,
         allowNull: true,
         references: {
            model: 'mst_marital_statuses',
            key: 'id'
         }
      },
      npwp: {
         type: DataTypes.STRING,
         allowNull: true
      },
      emergency_contact: {
         type: DataTypes.STRING,
         allowNull: true
      },
      position_id: {
         type: DataTypes.STRING,
         allowNull: true,
         references: {
            model: 'mst_positions',
            key: 'id'
         }
      },
      department_id: {
         type: DataTypes.STRING,
         allowNull: true,
         references: {
            model: 'mst_departments',
            key: 'id'
         }
      },
      manager_id: {
         type: DataTypes.STRING,
         allowNull: true
      },
      supervisor_id: {
         type: DataTypes.STRING,
         allowNull: true
      },
      team_lead_id: {
         type: DataTypes.STRING,
         allowNull: true
      },
      mentor_id: {
         type: DataTypes.STRING,
         allowNull: true
      },
      tenant_id: {
         type: DataTypes.STRING,
         allowNull: true,
         references: {
            model: 'mst_tenants',
            key: 'id'
         }
      },
      image_url: {
         type: DataTypes.STRING,
         allowNull: true
      },
      medical_condition:{
         type: DataTypes.TEXT,
         allowNull: true
      },
      deleted: {
         type: DataTypes.INTEGER,
         allowNull: true,
         defaultValue: 0
      },
      created_by: {
         type: DataTypes.STRING,
         allowNull: true
      },
      updated_by: {
         type: DataTypes.STRING,
         allowNull: true
      },
      created_at: {
         type: DataTypes.DATE,
         allowNull: true
      },
      updated_at: {
         type: DataTypes.DATE,
         allowNull: true
      },
   },
   {
      sequelize: db,
      modelName: 'Employee',
      tableName: 'mst_employees',
      timestamps: true,
      underscored: true
   }
)

export default Employee
