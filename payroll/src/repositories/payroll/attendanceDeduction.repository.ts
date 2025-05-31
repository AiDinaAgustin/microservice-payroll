import { IAttendanceDeduction } from '@interfaces/payroll/IAttendanceDeduction'
import PayrollAttendanceDeduction from '@models/Payroll/AttendanceDeduction'
import PayrollAttendance from '@models/Payroll/Attendance'
import Employee from '@models/Employee'
import { Op } from 'sequelize'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  period?: string;
}

class AttendanceDeductionRepository {
    async create(data: IAttendanceDeduction) {
        return await PayrollAttendanceDeduction.create(data)
    }
            
    async findByEmployeeAndPeriod(employeeId: string, period: string, tenantId: string) {
        return await PayrollAttendanceDeduction.findOne({
            where: {
                employee_id: employeeId,
                period: period,
                tenant_id: tenantId,
                deleted: false
            }
        });
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
            whereClause.employee_id = employeeId
        }

        if (period) {
            whereClause.period = period
        }

        return await PayrollAttendanceDeduction.findAndCountAll({
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
        return await PayrollAttendanceDeduction.findOne({
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
    
    async update(id: string, tenantId: string, data: Partial<IAttendanceDeduction>) {
        const deduction = await PayrollAttendanceDeduction.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        })
    
        if (!deduction) {
            throw new Error('Attendance deduction not found')
        }
    
        return await deduction.update(data)
    }
    
    async delete(id: string, tenantId: string) {
        const deduction = await PayrollAttendanceDeduction.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        })
    
        if (!deduction) {
            throw new Error('Attendance deduction not found')
        }
    
        return await deduction.update({ deleted: true })
    }
}

export default new AttendanceDeductionRepository()