import { db } from '../../config/database';
import { Model, DataTypes } from 'sequelize';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import bcrypt from 'bcrypt';
import Role from './Role';
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;

  declare tenant_id: string;

  declare role_id: string;

  declare username: string;

  declare password: string;

  declare last_login: Date | null;

  declare employee_id: string;

  declare deleted: number;

  declare created_by: string;

  declare updated_by: string;

  declare created_at: Date;

  declare updated_at: Date;

  declare readonly role?: Role;

  comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    employee_id: {
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
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'User',
    tableName: 'sys_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default User;
