import Contract from "../models/Contract"
import ContractType from "../models/ContractType"
import Department from "../models/Department"
import Employee from "../models/Employee"
import Position from "../models/Position"
import Role from "../models/Role"
import Tenant from "../models/Tenant"
import User from "../models/User"
import MaritalStatus from "../models/MaritalStatus"
import RolePermission from "../models/RolePermission"
import Permission from "../models/Permission"

// Define associations
Contract.belongsTo(ContractType, { foreignKey: 'contract_type_id', as: 'contractType' })

ContractType.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' })
ContractType.hasMany(Contract, {foreignKey: 'contract_type_id', as: 'contract'})
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees'});

Position.hasMany(Employee, { foreignKey: 'position_id', as: 'employees' });
Position.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Employee.belongsTo(Position, { foreignKey: 'position_id', as: 'position' })
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' })
Employee.belongsTo(MaritalStatus, { foreignKey: 'marital_status_id', as: 'maritalStatus' })
Employee.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' })
Employee.hasMany(Contract, {foreignKey: 'employee_id', as: 'contracts'})
Employee.belongsTo(Employee, { as: 'manager', foreignKey: 'manager_id' });
Employee.belongsTo(Employee, { as: 'supervisor', foreignKey: 'supervisor_id' });
Employee.belongsTo(Employee, { as: 'teamLead', foreignKey: 'team_lead_id' });
Employee.belongsTo(Employee, { as: 'mentor', foreignKey: 'mentor_id' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

