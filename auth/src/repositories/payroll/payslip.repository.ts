import { IPayslip } from '@interfaces/payroll/IPayslip'
import PayrollPayslip from '@models/Payroll/Payslip'
import Employee from '@models/Employee'
// import { Op } from 'sequelize'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  period?: Date;
}

class PayslipRepository {
    async create(data: IPayslip) {
        return await PayrollPayslip.create(data)
    }

    async findAll({ tenantId, page = 1, limit = 10, employeeId, period }: FindAllParams) {
        const offset = (page - 1) * limit
        const whereClause: any = { 
            deleted: false,
            tenant_id: tenantId
        }

        if (employeeId) whereClause.employee_id = employeeId
        if (period) whereClause.period = period

        return await PayrollPayslip.findAndCountAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }],
            limit,
            offset,
            order: [['period', 'DESC']]
        })
    }

    async findById(id: string, tenantId: string) {
        return await PayrollPayslip.findOne({
            where: { id, tenant_id: tenantId, deleted: false },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }]
        })
    }

    async findByEmployeeId(employeeId: string, tenantId: string) {
        return await PayrollPayslip.findAll({
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
            order: [['period', 'DESC']]
        })
    }
}

export default new PayslipRepository()