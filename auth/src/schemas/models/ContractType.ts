import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { db } from '@config/database'
import Tenant from '@models/Tenant'
import { v4 as uuidv4 } from 'uuid';

class ContractType extends Model<InferAttributes<ContractType>, InferCreationAttributes<ContractType>> {
   declare id: CreationOptional<string>
   declare name: string
   declare tenant_id: string
   declare is_permanent: boolean
   declare status: CreationOptional<'active' | 'inactive'>
   declare deleted: CreationOptional<number>
   declare created_by: CreationOptional<string>
   declare updated_by: CreationOptional<string>
   declare created_at: CreationOptional<Date>
   declare updated_at: CreationOptional<Date>
   declare readonly employee_count?: number
}

ContractType.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tenant_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: Tenant,
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        is_permanent: {
            type: DataTypes.BOOLEAN,
            allowNull: true
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
        modelName: 'ContractType',
        tableName: 'mst_contract_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)


export default ContractType
