import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { db } from '@config/database'

class EmployeeRole extends Model<InferAttributes<EmployeeRole>, InferCreationAttributes<EmployeeRole>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare level: string;
    declare deleted: CreationOptional<number>
    declare created_by: CreationOptional<string>
    declare updated_by: CreationOptional<string>
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
}

EmployeeRole.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        modelName: 'EmployeeRole',
        tableName: 'mst_employee_roles',
        timestamps: false
    }
)

export default EmployeeRole