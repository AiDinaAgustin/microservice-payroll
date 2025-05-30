import Employee from '@models/Employee'
import Position from '@models/Position'
import Department from '@models/Department'
import MaritalStatus from '@models/MaritalStatus'
import Tenant from '@models/Tenant'
import errorThrower from '@utils/errorThrower'
import { BaseError, col, Op, Sequelize, where } from 'sequelize'
import {
   EmployeeEndContractParams,
   EmployeeOptionParams,
   EmployeeSearchParams,
   EmployeeWhatsOnTodayParams,
   StatusEmployeeParams
} from '@interfaces/EmployeeSearchParams'
import ContractType from '@models/ContractType'
import Contract from '@models/Contract'
import { DashboardFindParams } from '@interfaces/dashboard/dashboardParams'
import {
   ConvertDateToYYYMMDD,
   getCurrentMonthRange,
   getDateRangeByMonth,
   getMonthRangeFromDate,
   getQuarterDateRange
} from '@services/convert-date/converterDate'
import { UpdateEmployeeRequest } from '@interfaces/employee/UpdateEmployeeRequest'

const findAllEmployees = async ({
   tenantId,
   limit,
   page,
   keyword,
   position,
   department,
   contractType,
   status,
   sortBy = 'name',
   sortOrder = 'ASC'
}: EmployeeSearchParams) => {
   try {
      const offset: number = (page - 1) * limit
      const whereClause: any = { deleted: 0 }

      if (tenantId) {
         whereClause.tenant_id = tenantId
      }

      if (keyword) {
         whereClause[Op.or] = [{ name: { [Op.iLike]: `%${keyword}%` } }, { nik: { [Op.iLike]: `%${keyword}%` } }]
      }

      if (position) {
         whereClause.position_id = Array.isArray(position) ? { [Op.in]: position } : position
      }

      if (department) {
         whereClause.department_id = Array.isArray(department) ? { [Op.in]: department } : department
      }

      if (status) {
         whereClause.status = Array.isArray(status) ? { [Op.in]: status } : status
      }

      const includeClause: any = [
         { model: Position, as: 'position', attributes: ['id', 'name'] },
         { model: Department, as: 'department', attributes: ['id', 'name'] },
         { model: MaritalStatus, as: 'maritalStatus', attributes: ['id', 'status'] },
         { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
         {
            model: Contract,
            as: 'contracts',
            attributes: ['id', 'start_date', 'end_date'],
            where: { deleted: 0 },
            order: [['end_date', 'desc']],
            required: false,
            include: [
               {
                  model: ContractType,
                  as: 'contractType',
                  attributes: ['id', 'name', 'is_permanent'],
                  where: contractType
                     ? { id: Array.isArray(contractType) ? { [Op.in]: contractType } : contractType }
                     : undefined
               }
            ]
         }
      ]

      const { rows: data, count: total } = await Employee.findAndCountAll({
         where: whereClause,
         limit,
         offset,
         include: includeClause,
         order: [[sortBy, sortOrder]]
      })

      return { data, total }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findEmployeeById = async (id: string) => {
   try {
      const employee = await Employee.findByPk(id, {
         include: [
            { model: Position, as: 'position' },
            { model: Department, as: 'department' },
            { model: MaritalStatus, as: 'maritalStatus' },
            { model: Tenant, as: 'tenant' },
            {
               model: Contract,
               as: 'contracts',
               attributes: ['id', 'start_date', 'end_date', 'contract_type_id'],
               where: { deleted: 0 },
               order: [['end_date', 'desc']],
               required: false,
               include: [{ model: ContractType, as: 'contractType' }]
            },
            { model: Employee, as: 'manager', attributes: ['name'] },
            { model: Employee, as: 'supervisor', attributes: ['name'] },
            { model: Employee, as: 'teamLead', attributes: ['name'] },
            { model: Employee, as: 'mentor', attributes: ['name'] }
         ]
      })

      if (!employee) {
         throw new Error('Employee not found')
      }

      const manager = employee.manager_id
         ? await Employee.findByPk(employee.manager_id, { attributes: ['id', 'name'] })
         : null
      const supervisor = employee.supervisor_id
         ? await Employee.findByPk(employee.supervisor_id, { attributes: ['id', 'name'] })
         : null
      const teamLead = employee.team_lead_id
         ? await Employee.findByPk(employee.team_lead_id, { attributes: ['id', 'name'] })
         : null
      const mentor = employee.mentor_id
         ? await Employee.findByPk(employee.mentor_id, { attributes: ['id', 'name'] })
         : null

      return {
         ...employee.toJSON(),
         manager_name: manager ? manager.name : null,
         supervisor_name: supervisor ? supervisor.name : null,
         team_lead_name: teamLead ? teamLead.name : null,
         mentor_name: mentor ? mentor.name : null
      }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const updateEmployeeStatus = async (id: string, status: string) => {
   const employee = await Employee.findByPk(id)
   if (!employee) throw new Error('Employee not found')

   employee.status = status
   await employee.save()

   return employee
}

const findAllEmployeeOption = async ({
   tenantId,
   limit,
   keyword,
   employeeId,
   managerId,
   supervisorId,
   mentorId,
   leadId
}: EmployeeOptionParams) => {
   try {
      const whereClause: any = {
         deleted: 0,
         ...(tenantId && { tenant_id: tenantId }),
         ...(employeeId && { id: { [Op.not]: employeeId } }),
         ...(managerId && { id: managerId }),
         ...(supervisorId && { id: supervisorId }),
         ...(mentorId && { id: mentorId }),
         ...(leadId && { id: leadId })
      }

      if (keyword) whereClause[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }
      const { rows: results } = await Employee.findAndCountAll({
         where: whereClause,
         limit,
         order: [['name', 'ASC']]
      })

      const data = results.map(({ id, name }: any) => ({ id, name }))

      return { data }
   } catch (err: any) {
      throw errorThrower(err.message)
   }
}

const findOneEmployeeByEmployeeNumber = async (employee_number: string) => {
   try {
      const employee = await Employee.findOne({
         where: { employee_id: employee_number }
      })

      return employee
   } catch (err: any) {
      throw errorThrower(err.message)
   }
}

const findEmployeeByEndContractSoon = async (
   { todaysDate, next30Days }: { todaysDate: Date; next30Days: Date },
   params: EmployeeEndContractParams
) => {
   try {
      const { rows: data, count: total } = await Employee.findAndCountAll({
         include: [
            {
               model: Contract,
               as: 'contracts',
               attributes: ['end_date'],
               where: {
                  end_date: {
                     [Op.between]: [todaysDate, next30Days]
                  }
               },
               include: [
                  {
                     model: ContractType,
                     as: 'contractType',
                     attributes: ['name']
                  }
               ]
            },
            {
               model: Position,
               as: 'position',
               attributes: ['name']
            }
         ],
         where: { tenant_id: params.tenant_id },
         attributes: ['id', 'name', 'status'],
         order: [[{ model: Contract, as: 'contracts' }, 'end_date', 'ASC']]
      })

      const result = data.map((employee) => {
         const format = {
            id: employee.id,
            name: employee.name,
            status: employee.status,
            job_title: employee.position?.name,
            ending_date: employee.contracts?.map((contract) => {
               return contract.end_date
            })[0],
            contract_type: employee.contracts?.map((contract) => {
               return contract.contractType?.name
            })[0]
         }
         return format
      })

      return { data: result, total }
   } catch (err: any) {
      throw errorThrower(err.message)
   }
}

const findInsight = async ({
   tenantId,
   byDate,
   startDate,
   endDate,
   byMonth,
   byYear,
   byQuarter
}: DashboardFindParams) => {
   try {
      let results: any = {
         totalEmployees: 0,
         totalOnleaveEmployees: 0,
         totalNewHireEmployees: 0,
         totalContractEndingEmployees: 0
      }
      let startDateRange: string | null = null
      let endDateRange: string | null = null

      if (byDate) {
         const formattedDate = ConvertDateToYYYMMDD(byDate)
         const monthRange = getMonthRangeFromDate(byDate)
         startDateRange = monthRange.startDate
         endDateRange = monthRange.endDate

         const whereClauseByDate = buildWhereClauseInsight(tenantId, formattedDate)
         const whereClauseByDateOnLeave = buildWhereClauseInsight(
            tenantId,
            formattedDate,
            undefined,
            undefined,
            'on leave',
            undefined,
            true
         )

         results.totalEmployees = await Employee.count({ where: whereClauseByDate })
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseByDateOnLeave })
         results.totalNewHireEmployees = await Employee.count({
            where: buildWhereClauseNewHire(tenantId, undefined, undefined, formattedDate),
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: { deleted: 0 }
               }
            ]
         })
      }

      if (startDate && endDate) {
         startDateRange = ConvertDateToYYYMMDD(startDate)
         endDateRange = ConvertDateToYYYMMDD(endDate)

         const whereClauseByRange = buildWhereClauseInsight(tenantId, undefined, startDateRange, endDateRange)
         const whereClauseByRangeOnLeave = buildWhereClauseInsight(
            tenantId,
            undefined,
            startDateRange,
            endDateRange,
            'on leave',
            undefined,
            true
         )
         results.totalEmployees = await Employee.count({ where: whereClauseByRange })
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseByRangeOnLeave })
         results.totalNewHireEmployees = await Employee.count({
            where: buildWhereClauseNewHire(tenantId, startDateRange, startDateRange),
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: { deleted: 0 }
               }
            ]
         })
      }

      if (byMonth) {
         const monthRange = getDateRangeByMonth(byMonth)
         startDateRange = monthRange.startDate
         endDateRange = monthRange.endDate

         const whereClauseByDate = buildWhereClauseInsight(tenantId, undefined, startDateRange, endDateRange)
         const whereClauseByDateOnLeave = buildWhereClauseInsight(
            tenantId,
            undefined,
            startDateRange,
            endDateRange,
            'on leave',
            undefined,
            true
         )
         results.totalEmployees = await Employee.count({ where: whereClauseByDate })
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseByDateOnLeave })
         results.totalNewHireEmployees = await Employee.count({
            where: buildWhereClauseNewHire(tenantId, startDateRange, startDateRange),
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: { deleted: 0 }
               }
            ]
         })
      }

      if (byYear) {
         const whereClauseByYear = buildWhereClauseInsight(tenantId, undefined, undefined, undefined, undefined, byYear)
         const whereClauseByDateOnLeave = buildWhereClauseInsight(
            tenantId,
            undefined,
            undefined,
            undefined,
            'on leave',
            byYear
         )
         results.totalEmployees = await Employee.count({ where: whereClauseByYear })
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseByDateOnLeave })
         results.totalNewHireEmployees = await Employee.count({
            where: buildWhereClauseNewHire(tenantId, undefined, undefined, undefined, byYear),
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: { deleted: 0 }
               }
            ]
         })
      }

      if (byQuarter) {
         const monthRange = getQuarterDateRange(byQuarter)
         startDateRange = monthRange.startDate
         endDateRange = monthRange.endDate

         const whereClauseByDate = buildWhereClauseInsight(tenantId, undefined, startDateRange, endDateRange)
         const whereClauseByDateOnLeave = buildWhereClauseInsight(
            tenantId,
            undefined,
            startDateRange,
            endDateRange,
            'on leave',
            undefined,
            true
         )
         results.totalEmployees = await Employee.count({ where: whereClauseByDate })
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseByDateOnLeave })
         results.totalNewHireEmployees = await Employee.count({
            where: buildWhereClauseNewHire(tenantId, startDateRange, startDateRange),
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: { deleted: 0 }
               }
            ]
         })
      }

      if (!byDate && !startDate && !endDate && !byMonth && !byYear && !byQuarter) {
         const monthRange = getCurrentMonthRange()
         startDateRange = monthRange.startDate
         endDateRange = monthRange.endDate

         const whereClauseDefault = buildWhereClauseInsight(tenantId, startDateRange)
         const whereClauseDefaultOnLeave = buildWhereClauseInsight(
            tenantId,
            startDateRange,
            undefined,
            undefined,
            'on leave',
            undefined,
            true
         )
         results.totalOnleaveEmployees = await Employee.count({ where: whereClauseDefaultOnLeave })
         results.totalEmployees = await Employee.count({ where: whereClauseDefault })
         results.totalNewHireEmployees = await Employee.count({
            where: {
               deleted: 0,
               tenant_id: tenantId
            },
            include: [
               {
                  model: Contract,
                  as: 'contracts',
                  required: true,
                  where: {
                     deleted: 0,
                     start_date: Sequelize.where(
                        Sequelize.fn('DATE', Sequelize.col('contracts.start_date')),
                        '=',
                        Sequelize.literal('CURRENT_DATE')
                     )
                  }
               }
            ]
         })
      }

      results.totalContractEndingEmployees = await Employee.count({
         where: {
            deleted: 0,
            tenant_id: tenantId
         },
         include: [
            {
               model: Contract,
               as: 'contracts',
               required: true,
               where: {
                  deleted: 0,
                  ...(startDateRange && endDateRange && !byYear
                     ? {
                          end_date: {
                             [Op.ne]: null,
                             [Op.gte]: Sequelize.fn('DATE', startDateRange),
                             [Op.lte]: Sequelize.fn('DATE', endDateRange)
                          }
                       }
                     : {}),
                  ...(byYear
                     ? {
                          end_date: Sequelize.where(
                             Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "end_date"')),
                             '=',
                             byYear
                          )
                       }
                     : {})
               }
            }
         ]
      })

      return results
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const buildWhereClauseInsight = (
   tenantId?: string,
   byDate?: string,
   startDate?: string,
   endDate?: string,
   status?: string,
   byYear?: string,
   isOnLeave?: boolean
) => {
   const whereClause: any = { deleted: 0, tenant_id: tenantId }
   if (status) {
      whereClause.status = status
   }
   if (byDate && !isOnLeave) {
      whereClause.created_at = {
         [Op.and]: [Sequelize.where(Sequelize.fn('DATE', Sequelize.col('created_at')), '<=', byDate)]
      }
   }
   if (byDate && isOnLeave) {
      whereClause.updated_at = {
         [Op.and]: [Sequelize.where(Sequelize.fn('DATE', Sequelize.col('updated_at')), '<=', byDate)]
      }
   }
   if (startDate && endDate) {
      whereClause.created_at = {
         [Op.and]: [
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('created_at')), '>=', startDate),
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('created_at')), '<=', endDate)
         ]
      }
   }

   if (startDate && endDate && isOnLeave) {
      whereClause.updated_at = {
         [Op.and]: [
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('updated_at')), '>=', startDate),
            Sequelize.where(Sequelize.fn('DATE', Sequelize.col('updated_at')), '<=', endDate)
         ]
      }
   }

   if (byYear) {
      whereClause.created_at = {
         [Op.and]: [Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "created_at"')), '=', byYear)]
      }
   }
   return whereClause
}

const buildWhereClauseNewHire = (
   tenantId?: string,
   startDate?: string,
   endDate?: string,
   byDate?: string,
   byYear?: string
) => {
   const whereClause: any = {
      deleted: 0,
      tenant_id: tenantId
   }
   if (byDate) {
      whereClause['$contracts.start_date$'] = Sequelize.where(
         Sequelize.fn('DATE', Sequelize.col('contracts.start_date')),
         '=',
         byDate
      )
   }
   if (startDate && endDate) {
      whereClause['$contracts.start_date$'] = {
         [Op.between]: [startDate, endDate]
      }
   }
   if (byYear) {
      whereClause['$contracts.start_date$'] = Sequelize.where(
         Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "contracts"."start_date"')),
         '=',
         byYear
      )
   }
   console.log('whereClause', whereClause)

   return whereClause
}

export const updateEmployee = async (id: string, tenant_id: string, request: object) => {
   try {
      const whereClause: any = { deleted: 0, id: id }

      if (tenant_id) {
         whereClause.tenant_id = tenant_id
      }

      const [affectedRows] = await Employee.update(request, {
         where: whereClause
      })

      return affectedRows
   } catch (err) {
      throw errorThrower(err)
   }
}

const findWhatsOnToday = async ({ tenant_id, position, isOnleave, isBirthDate }: EmployeeWhatsOnTodayParams) => {
   const currentDate = new Date()

   const whereClause: { [key: string]: any } = { deleted: 0 }

   if (tenant_id) {
      whereClause.tenant_id = tenant_id
   }

   if (isOnleave) {
      whereClause.status = 'on leave'
   }

   if (isBirthDate) {
      whereClause[Op.and as any] = [
         Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM birth_date')), currentDate.getDate()),
         Sequelize.where(
            Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM birth_date')),
            currentDate.getMonth() + 1
         )
      ]
   }

   if (position) {
      const positionFilter = Array.isArray(position) ? { [Op.in]: position } : position
      whereClause.position_id = positionFilter
   }

   const includeClause = [{ model: Position, as: 'position', attributes: ['id', 'name'] }]

   const result = await Employee.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['name', 'ASC']]
   })

   return {
      content: result.rows,
      total: result.count
   }
}

export default {
   findWhatsOnToday,
   findAllEmployees,
   findEmployeeById,
   updateEmployeeStatus,
   findAllEmployeeOption,
   findOneEmployeeByEmployeeNumber,
   findEmployeeByEndContractSoon,
   findInsight,
   updateEmployee
}
