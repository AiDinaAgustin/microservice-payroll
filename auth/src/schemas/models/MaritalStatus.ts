import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { db } from '@config/database'

class MaritalStatus extends Model<InferAttributes<MaritalStatus>, InferCreationAttributes<MaritalStatus>> {
  declare id: string
  declare status: string
  declare deleted: CreationOptional<number>
  declare created_by: CreationOptional<string>
  declare updated_by: CreationOptional<string>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

MaritalStatus.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'MaritalStatus',
    tableName: 'mst_marital_statuses',
    timestamps: false
  }
)

export default MaritalStatus
