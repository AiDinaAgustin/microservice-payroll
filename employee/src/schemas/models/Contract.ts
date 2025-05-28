import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { db } from '@config/database'
import Employee from './Employee'
import ContractType from './ContractType'
import { v4 as uuidv4 } from 'uuid';

class Contract extends Model<InferAttributes<Contract>, InferCreationAttributes<Contract>> {
   declare id: CreationOptional<string>
   declare employee_id: string
   declare contract_type_id: string
   declare start_date: Date | undefined
   declare end_date?: Date | null
   declare deleted: CreationOptional<number>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
   declare readonly contractType? : ContractType;
}

Contract.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
            allowNull: false
        },
        employee_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contract_type_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
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
        modelName: 'Contract',
        tableName: 'trx_contracts',
        timestamps: true,
        underscored: true,
    }
)

export default Contract
