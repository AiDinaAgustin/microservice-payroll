import { IAttendance } from '@interfaces/payroll/IAttendance'
import PayrollAttendance from '@models/Payroll/Attendance'
import Employee from '@models/Employee'
import { Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Sequelize from 'sequelize'

interface FindAllParams {
  tenantId: string;
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

class AttendanceRepository {
    async create(data: IAttendance) {
        return await PayrollAttendance.create(data)
    }
    
    async findByEmployeeAndPeriod(employeeId: string, startDate: Date, endDate: Date) {
        return await PayrollAttendance.findAll({
            where: {
                employee_id: employeeId,
                date: {
                    [Op.between]: [startDate, endDate]
                },
                deleted: false
            }
        })
    }
      
    async findAll({ 
        tenantId, 
        page = 1, 
        limit = 10,
        employeeId,
        startDate,
        endDate,
        keyword 
    }: FindAllParams) {
        const offset = (page - 1) * limit
        const whereClause: any = { 
            deleted: false,
            tenant_id: tenantId
        }
    
        if (employeeId) {
            whereClause.employee_id = employeeId
        }
    
        if (startDate && endDate) {
            whereClause.date = {
                [Op.between]: [startDate, endDate]
            }
        }
    
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
    
        return await PayrollAttendance.findAndCountAll({
            where: whereClause,
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'employee_id']
            }],
            limit,
            offset,
            order: [['date', 'DESC']]
        })
    }

    async findById(id: string, tenantId: string) {
        return await PayrollAttendance.findOne({
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
        return await PayrollAttendance.findAll({
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
            order: [['date', 'DESC']]
        })
    }
        
    async update(id: string, tenantId: string, data: Partial<IAttendance>) {
        const attendance = await PayrollAttendance.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        })
    
        if (!attendance) {
            throw new Error('Attendance not found')
        }
    
        return await attendance.update(data)
    }
    
    async delete(id: string, tenantId: string) {
        const attendance = await PayrollAttendance.findOne({
            where: {
                id,
                tenant_id: tenantId,
                deleted: false
            }
        })
    
        if (!attendance) {
            throw new Error('Attendance not found')
        }
    
        // Soft delete by setting deleted flag to true
        return await attendance.update({ deleted: true })
    }
    
    async findUniqueEmployeesInPeriod(tenantId: string, startDate: Date, endDate: Date) {
      // Find all unique employees who have attendance records in this period
      const uniqueEmployees = await PayrollAttendance.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('employee_id')), 'employee_id']
        ],
        where: {
          tenant_id: tenantId,
          date: {
            [Op.between]: [startDate, endDate]
          },
          deleted: false
        },
        raw: true
      });
      
      return uniqueEmployees;
    }
}

export default new AttendanceRepository()