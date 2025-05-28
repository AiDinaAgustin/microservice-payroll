import { PositionCreateParams } from '@interfaces/position/positionCreateParams'
import { PositionOptionParams } from '@interfaces/position/positionOptionParams'
import { PositionFindParams } from '@interfaces/position/positionFindParams'
import errorThrower from '@utils/errorThrower'
import { Op, Sequelize } from 'sequelize'
import Position from '@models/Position'
import Employee from '@models/Employee'
import Department from '@models/Department'
import { PositionUpdateParams } from '@interfaces/position/positionUpdateParams'
import { RecordStatus } from '@enums/statusEnum'

const findAllPositionOption = async ({ limit, tenantId, departmentId, keyword }: PositionOptionParams) => {
   try {
      let whereClause: any = { deleted: 0, status: RecordStatus.ACTIVE }

      if (tenantId) whereClause['tenant_id'] = tenantId

      if (departmentId) whereClause['department_id'] = departmentId

      if (keyword) whereClause[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }

      const { rows: results } = await Position.findAndCountAll({
         where: whereClause,
         limit,
         attributes: ['id', 'name'],
         order: [['name', 'ASC']]
      })

      const data = results.map(({ id, name }: any) => ({ id, name }))

      return { data }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findAllPosition = async ({
   page,
   limit,
   tenantId,
   departmentId,
   keyword,
   sortBy = 'name',
   sortOrder = 'ASC',
   status
}: PositionFindParams) => {
   try {
      const offset: number = (page - 1) * limit

      const whereClause: any = {
         deleted: 0
      }

      if (tenantId) {
         whereClause.tenant_id = tenantId
      }

      if (!tenantId) {
         throw new Error('tenantId is required')
      }

      if (departmentId) {
         whereClause.department_id = departmentId
      }

      if (keyword) {
         whereClause[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }
      }

      if (status) {
         whereClause.status = status
      }

      const positions = await Position.findAll({
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
            },
            {
               model: Department,
               as: 'department',
               attributes: ['id', 'name']
            }
         ],
         attributes: {
            include: [[Sequelize.fn('COUNT', Sequelize.col('employees.id')), 'employeeCount']]
         },
         group: ['Position.id', 'employees.position_id', 'department.id'],
         subQuery: false
      })

      return { data: positions }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const createPosition = async (params: PositionCreateParams) => {
   try {
      const { name, tenantId, departmentId } = params

      if (!tenantId) {
         throw new Error('Tenant ID is required')
      }

      if (!departmentId) {
         throw new Error('Department ID is required')
      }

      const isUnique = await isPositionNameUnique(name, tenantId, departmentId);

      if (!isUnique) {
         throw new Error('Position name already exists')
      }

      const position = await Position.create({ name, tenant_id: tenantId, department_id: departmentId })

      return position
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const updatePosition = async (id: string, params: PositionUpdateParams) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: params.tenantId }
      }

      if (!params.tenantId) {
         throw new Error('tenantId is required')
      }

      const position = await Position.findOne(whereClause)

      if (!position) {
         throw new Error('Position not found')
      }

      const { name, status, departmentId } = params;

      if (!departmentId) {
         throw new Error('Department ID is required')
      }

      if (name.trim().toLowerCase() !== position.name.trim().toLowerCase()){
         const isUnique = await isPositionNameUnique(name, params.tenantId, departmentId)
      if (!isUnique) {
         throw new Error('Position name already exists')
      }
      }
      position.name = name

      if (status) {
         if (status === 'inactive') {
            const employees = await Employee.findAll({
               where: { position_id: id, deleted: 0 }
            })

            if (employees.length > 0) {
               throw new Error('Position with employees cannot be set to inactive')
            }
         }
         position.status = status
      }

      if (departmentId && departmentId !== position.department_id) {
         const employees = await Employee.findAll({
            where: { position_id: id, deleted: 0 }
         })

         await Employee.update(  { department_id: departmentId },  { where: { id: employees.map((employee) => employee.id) } })

         position.department_id = departmentId
      }

      await position.save()
      return position
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const deletePosition = async (id: string, tenantId: string) => {
   try {
      const whereCaluse: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const position = await Position.findOne(whereCaluse)

      if (!position) {
         throw new Error('Position not found')
      }

      const employees = await Employee.findOne({
         where: { position_id: id, deleted: 0 }
      })

      if (employees) {
         throw new Error('Position with employees cannot be deleted')
      }

      position.deleted = 1
      await position.save()
      return position
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findPositionById = async (id: string, tenantId: string) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const position = await Position.findOne(whereClause)
      if (!position) {
         throw new Error('Position not found')
      }

      return position
   } catch (err) {
      throw errorThrower(err)
   }
}

const patchPositionStatus = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const position = await Position.findOne(whereClause)
      if (!position) {
         throw new Error('Position not found')
      }

      if (status !== 'active' && status !== 'inactive') {
         throw new Error('Invalid status value')
      }

      position.status = status
      await position.save()
      return position
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const isPositionNameUnique = async (name: string, tenantId: string, departmentId: string) => {
   try {
      const position = await Position.findOne({
         where: {
            name: { [Op.iLike]: name.trim() },
            tenant_id: tenantId,
            department_id: departmentId,
            deleted: 0
         }
      })
      return !position
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default {
   findAllPositionOption,
   findAllPosition,
   createPosition,
   updatePosition,
   deletePosition,
   findPositionById,
   patchPositionStatus,
   isPositionNameUnique
}
