import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { db } from '@config/database'
import { v4 as uuidv4 } from 'uuid'
import Employee from '../Employee'

class PayrollAttendance extends Model<InferAttributes<PayrollAttendance>, InferCreationAttributes<PayrollAttendance>> {
   declare id: CreationOptional<string>
   declare employee_id: string
   declare tenant_id: string
   declare date: Date
   declare status: string
   declare check_in: CreationOptional<Date>
   declare check_out: CreationOptional<Date>
   declare late_minutes: CreationOptional<number>
   declare deleted: CreationOptional<boolean>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
   declare readonly employee?: Employee
}

PayrollAttendance.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
      allowNull: false
    },
    check_in: {
      type: DataTypes.DATE
    },
    check_out: {
      type: DataTypes.DATE
    },
    late_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'payroll_attendances',
    timestamps: true
  }
)

// Add association
PayrollAttendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
})

export default PayrollAttendance