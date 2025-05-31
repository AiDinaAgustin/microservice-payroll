import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { db } from '@config/database'
import { v4 as uuidv4 } from 'uuid'

class PayrollSalary extends Model<InferAttributes<PayrollSalary>, InferCreationAttributes<PayrollSalary>> {
   declare id: CreationOptional<string>
   declare employee_id: string
   declare tenant_id: string
   declare base_salary: number
   declare allowances: CreationOptional<number>
   declare period: Date
   declare effective_date: Date
   declare status: CreationOptional<string>
   declare deleted: CreationOptional<boolean>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
}

PayrollSalary.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    base_salary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    allowances: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_by: {
      type: DataTypes.UUID
    },
    updated_by: {
      type: DataTypes.UUID
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  },
  {
    sequelize: db,
    tableName: 'payroll_salaries',
    timestamps: true,
    underscored: true  // Add this line
  }
)

export default PayrollSalary