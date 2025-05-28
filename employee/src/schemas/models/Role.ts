import { DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { db } from '../../config/database';
import { Model } from 'sequelize';

class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: string;

  declare tenant_id: string;

  declare name: string;

  declare deleted : number;

  declare created_by : string;
  
  declare updated_by : string;

  declare created_at : Date;

  declare updated_at : Date;
}

Role.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    }, 
    tenant_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.NUMBER,
      allowNull:true, 
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'Role',
    tableName: 'sys_roles',
    timestamps: false,
  },
);

export default Role;
