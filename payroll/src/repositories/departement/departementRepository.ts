import { DepartmentOptionParams } from '@interfaces/department/departmentOptionParams'
import { DepartmentCreateParams } from '@interfaces/department/departmentCreateParams'
import { DepartmentFindParams } from '@interfaces/department/departmentFindParams'
import { DepartmentUpdateParams } from '@interfaces/department/departmentUpdateParams'
import Department from '@models/Department'
import Employee from '@models/Employee'
import Position from '@models/Position'
import errorThrower from '@utils/errorThrower'
import { Op } from 'sequelize'
import Sequelize from 'sequelize'
import { RecordStatus } from '@enums/statusEnum'
import { StatusCodes } from 'http-status-codes'
import BaseError from '@responses/BaseError'

const findAllDepartmentOption = async ({ limit, tenantId, keyword }: DepartmentOptionParams) => {
   try {
      const queryOptions: any = {
         where: { deleted: 0, status: RecordStatus.ACTIVE },
         attributes: ['id', 'name'],
         limit,
         order: [['name', 'ASC']]
      }

      if (tenantId) {
         queryOptions.where.tenant_id = tenantId
      }

      if (keyword) {
         queryOptions.where[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }
      }

      const { rows: results } = await Department.findAndCountAll(queryOptions)

      const data = results.map(({ id, name }: any) => ({ id, name }))

      return { data }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findAllDepartment = async ({
   page,
   limit,
   tenantId,
   keyword,
   sortBy = 'name',
   sortOrder = 'ASC',
   status
}: DepartmentFindParams) => {
   try {
      const offset: number = (page - 1) * limit
      const whereClause: any = {
         deleted: 0
      }

      if (tenantId) {
         whereClause.tenant_id = tenantId
      }

      if (keyword) {
         whereClause[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }
      }

      if (status) {
         whereClause.status = status
      }

      const departments = await Department.findAll({
         where: whereClause,
         limit,
         offset,
         order: [[sortBy, sortOrder]],
         include: [
            {
               model: Employee,
               as: 'employees',
               attributes: [],
               where: { deleted: 0 },
               required: false
            }
         ],
         attributes: {
            include: [[Sequelize.fn('COUNT', Sequelize.col('employees.id')), 'employeeCount']]
         },
         group: ['Department.id', 'employees.department_id'],
         subQuery: false // Ensure the subquery is not used
      })

      return { data: departments }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const createDepartment = async (params: DepartmentCreateParams) => {
   try {
      const { name, tenantId } = params

      if (!tenantId) {
         throw new Error('tenantId is required')
      }

      const isUnique = await isDepartmentNameUnique(name, tenantId);

      if (!isUnique) {
         throw new Error('Department name already exists')
      }

      const department = await Department.create({ name, tenant_id: tenantId })
      return department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const updateDepartment = async (id: string, params: DepartmentUpdateParams) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: params.tenantId }
      }

      if (!params.tenantId) {
         throw new Error('tenantId is required')
      }

      const department = await Department.findOne(whereClause)

      if (!department) {
         throw new Error('Department not found')
      }

      const { name, status, tenantId } = params

      if (name.trim().toLowerCase() !== department.name.trim().toLowerCase()) {
         const isUnique = await isDepartmentNameUnique(name, tenantId)
         if (!isUnique) {
         throw new Error('Department name already exists')
      }
      }

      department.name = name

      if (status) {
         if (status === 'inactive') {
            const employees = await Employee.findAll({
               where: { department_id: id, deleted: 0 }
            })

            if (employees.length > 0) {
               throw new BaseError({
                  status: StatusCodes.BAD_REQUEST,
                  message: 'Department with employees cannot be set to inactive'
               })
            }

            const positions = await Position.findAll({
               where: { department_id: id, deleted: 0 }
            })

            if (positions.length > 0) {
               throw new BaseError({
                  status: StatusCodes.BAD_REQUEST,
                  message: 'Department with positions cannot be set to inactive'
               })
            }
         }
         department.status = status
      }

      await department.save()
      return department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const deleteDepartment = async (id: string, tenantId: string) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const department = await Department.findOne(whereClause)

      if (!department) {
         throw new Error('Department not found')
      }

      const employees = await Employee.findOne({
         where: { department_id: id, deleted: 0 }
      })

      if (employees) {
         throw new Error('Department with employees cannot be deleted')
      }

      const positions = await Position.findOne({
         where: { department_id: id, deleted: 0 }
      })

      if (positions) {
         throw new Error('Department with positions cannot be deleted')
      }

      department.deleted = 1
      await department.save()
      return department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findDepartmentById = async (id: string, tenantId: string) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const department = await Department.findOne(whereClause)

      if (!department) {
         throw new Error('Department not found')
      }

      return department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const patchDepartmentStatus = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const department = await Department.findOne(whereClause)
      if (!department) {
         throw new Error('Department not found')
      }

      if (status !== 'active' && status !== 'inactive') {
         throw new Error('Invalid status')
      }

      department.status = status
      await department.save()
      return department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const isDepartmentNameUnique = async (name: string, tenantId: string) => {
   try {
      const department = await Department.findOne({
         where: {
            name: { [Op.iLike]: name.trim() },
            tenant_id: tenantId,
            deleted: 0
         }
      })
      return !department
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default {
   findAllDepartmentOption,
   findAllDepartment,
   createDepartment,
   updateDepartment,
   deleteDepartment,
   findDepartmentById,
   patchDepartmentStatus,
   isDepartmentNameUnique
}
