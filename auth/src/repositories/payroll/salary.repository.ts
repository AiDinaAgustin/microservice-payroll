import { ISalary } from '@interfaces/payroll/ISalary'
import PayrollSalary from '@models/Payroll/Salary'
import Employee from '@models/Employee'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
}

class SalaryRepository {
    async create(data: ISalary) {
        return await PayrollSalary.create(data)
    }

    async findAll({ 
        tenantId, 
        page = 1, 
        limit = 10,
        employeeId
    }: FindAllParams) {
        const offset = (page - 1) * limit
        const whereClause: any = { 
            deleted: false,
            tenant_id: tenantId
        }

        if (employeeId) {
            whereClause.employee_id = employeeId
        }

        return await PayrollSalary.findAndCountAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        })
    }

    async findById(id: string, tenantId: string) {
        return await PayrollSalary.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }]
        })
    }

    async findByEmployeeId(employeeId: string, tenantId: string) {
        return await PayrollSalary.findAll({
            where: {
                employee_id: employeeId,
                tenant_id: tenantId,
                deleted: false
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }],
            order: [['effective_date', 'DESC']]
        })
    }
}

export default new SalaryRepository()