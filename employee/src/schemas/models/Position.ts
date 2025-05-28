import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { db } from '@config/database'
import { v4 as uuidv4 } from 'uuid';

class Position extends Model<InferAttributes<Position>, InferCreationAttributes<Position>> {
  declare id: CreationOptional<string>
  declare tenant_id: string
  declare department_id: string
  declare name: string
  declare status: CreationOptional<'active' | 'inactive'>
  declare deleted: CreationOptional<number>
  declare created_by: CreationOptional<string>
  declare updated_by: CreationOptional<string>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

Position.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: true,
      defaultValue: 'active'
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    }
  },
  {
    sequelize: db,
    modelName: 'Position',
    tableName: 'mst_positions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default Position