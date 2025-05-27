import { db } from '../../config/database';
import { Model, DataTypes, CreationOptional } from 'sequelize';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import Permission from './Permission';
import { v4 as uuidv4 } from 'uuid';

class RolePermission extends Model<InferAttributes<RolePermission>, InferCreationAttributes<RolePermission>> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare role_id: CreationOptional<string>;
  declare permission_id: CreationOptional<string>;
  declare deleted: CreationOptional<number>
  declare created_by: CreationOptional<string>
  declare updated_by: CreationOptional<string>
  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>
  declare readonly Permission?: Permission;
}

RolePermission.init(
  {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
     },
     tenant_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
           model: 'mst_tenants',
           key: 'id'
        }
     },
    role_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'RolePermission',
    tableName: 'sys_role_permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);


export default RolePermission;
