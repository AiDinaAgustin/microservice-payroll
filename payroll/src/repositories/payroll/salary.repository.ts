import { ISalary } from '@interfaces/payroll/ISalary'
import PayrollSalary from '@models/Payroll/Salary'
import Employee from '@models/Employee'
import { Op } from 'sequelize'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  period?: string
    keyword?: string;
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
        period,
        keyword = ''
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
    
        // Prepare the include options for Employee model
        const includeOptions: any = {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'name', 'employee_id']
        };
    
        // Add keyword search condition if provided
        if (keyword && keyword.trim() !== '') {
            includeOptions.where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${keyword}%` } },
                    { employee_id: { [Op.iLike]: `%${keyword}%` } }
                ]
            };
        }
    
        return await PayrollSalary.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [includeOptions] // Use the includeOptions object here
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