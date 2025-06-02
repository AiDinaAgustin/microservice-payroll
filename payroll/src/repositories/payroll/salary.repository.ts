import { ISalary } from '@interfaces/payroll/ISalary'
import PayrollSalary from '@models/Payroll/Salary'
import Employee from '@models/Employee'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  period?: string
}

class SalaryRepository {
    async create(data: ISalary) {
        return await PayrollSalary.create(data)
    }
    
    async findAll({ 
        tenantId, 
        page = 1, 
        limit = 10,
        employeeId,
        period
    }: FindAllParams) {
        const offset = (page - 1) * limit
        const whereClause: any = { 
            deleted: false,
            tenant_id: tenantId
        }
    
        if (employeeId) {
            whereClause.employee_id = employeeId;
        }

        if (period) {
            whereClause.period = period;
        }
    
        return await PayrollSalary.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }]
        });
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
    
    async update(id: string, tenantId: string, data: Partial<ISalary>) {
        const salary = await PayrollSalary.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        });
    
        if (!salary) {
            throw new Error('Salary not found');
        }
    
        return await salary.update(data);
    }
    
    async delete(id: string, tenantId: string) {
        const salary = await PayrollSalary.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        });
    
        if (!salary) {
            throw new Error('Salary not found');
        }
    
        return await salary.update({ deleted: true });
    }

    async findByEmployeeIdAndPeriod(employeeId: string, period: string, tenantId: string) {
        return await PayrollSalary.findOne({
            where: {
                employee_id: employeeId,
                period: period,
                tenant_id: tenantId,
                deleted: false
            }
        });
    }

    async findAllByPeriod(period: string, tenantId: string) {
      return await PayrollSalary.findAll({
        where: {
          period,
          tenant_id: tenantId,
          deleted: false
        }
      });
    }
}


export default new SalaryRepository()