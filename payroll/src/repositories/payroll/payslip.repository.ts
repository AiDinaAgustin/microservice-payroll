import { IPayslip } from '@interfaces/payroll/IPayslip'
import PayrollPayslip from '@models/Payroll/Payslip'
import Employee from '@models/Employee'
import { Op } from 'sequelize'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  period?: string; // Changed from Date to string
  keyword?: string;
}

class PayslipRepository {
    async create(data: IPayslip) {
        return await PayrollPayslip.create(data)
    }

    async findAll({ tenantId, page = 1, limit = 10, employeeId, period, keyword }: FindAllParams) {
        const offset = (page - 1) * limit
        const whereClause: any = { 
            deleted: false,
            tenant_id: tenantId
        }
    
        if (employeeId) whereClause.employee_id = employeeId
        if (period) whereClause.period = period
    
        // Handle keyword search
        let employeeIds: string[] = [];
        
        if (keyword && keyword.trim() !== '') {
            // First, find all employees matching the keyword
            const matchingEmployees = await Employee.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${keyword}%` } },
                        { employee_id: { [Op.iLike]: `%${keyword}%` } }
                    ]
                },
                attributes: ['id']
            });
            
            // Extract the IDs
            employeeIds = matchingEmployees.map(emp => emp.id);
            
            // If we found matching employees, add them to the where clause
            if (employeeIds.length > 0) {
                whereClause.employee_id = {
                    [Op.in]: employeeIds
                };
            } else if (keyword.trim() !== '') {
                // If no matching employees but keyword provided, return empty result
                return { rows: [], count: 0 };
            }
        }
    
        return await PayrollPayslip.findAndCountAll({
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
        return await PayrollPayslip.findOne({
            where: { id, tenant_id: tenantId, deleted: false },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }]
        })
    }

    async findByEmployeeIdAndPeriod(employeeId: string, period: string, tenantId: string) {
        return await PayrollPayslip.findOne({
            where: {
                employee_id: employeeId,
                period,
                tenant_id: tenantId,
                deleted: false
            }
        })
    }
}

export default new PayslipRepository()