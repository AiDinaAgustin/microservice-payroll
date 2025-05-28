import { db } from '../../config/database';
import { Model, DataTypes, CreationOptional } from 'sequelize';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class Permission extends Model<InferAttributes<Permission>, InferCreationAttributes<Permission>> {
  declare id: CreationOptional<string>
  declare name: CreationOptional<string>
  declare code: CreationOptional<string>;
  declare endpoint: CreationOptional<string>
  declare parent_id: CreationOptional<string>
  declare type: CreationOptional<string>
  declare deleted: CreationOptional<number>
  declare created_by: CreationOptional<string>
  declare updated_by: CreationOptional<string>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Permission',
    tableName: 'sys_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default Permission;