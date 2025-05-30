import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { db } from '@config/database'
import { v4 as uuidv4 } from 'uuid'

class PayrollPayslip extends Model<InferAttributes<PayrollPayslip>, InferCreationAttributes<PayrollPayslip>> {
   declare id: CreationOptional<string>
   declare employee_id: string
   declare tenant_id: string
   declare period: Date
   declare base_salary: number
   declare total_deductions: CreationOptional<number>
   declare net_salary: number
   declare deleted: CreationOptional<boolean>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
}

PayrollPayslip.init(
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
      period: {
        type: DataTypes.DATE,
        allowNull: false
      },
      base_salary: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      total_deductions: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
      },
      net_salary: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
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
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize: db,
      tableName: 'payroll_payslips',
      timestamps: true
    }
  )

export default PayrollPayslip