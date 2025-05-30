import { ContractTypeOptionParams } from '@interfaces/contract-type/contractTypeOptionParams'
import ContractType from '@models/ContractType'
import errorThrower from '@utils/errorThrower'
import { col, fn, Op } from 'sequelize'
import { ContractTypeCreateParams } from '@interfaces/contract-type/ContractTypeCreateParams'
import { ContractTypeFindParams } from '@interfaces/contract-type/contractTypeFindParams'
import Contract from '@models/Contract'
import { UpdateContractTypeParams } from '@interfaces/contract-type/UpdateContractTypeParams'
import BaseError from '@responses/BaseError'
import { RecordStatus } from '@enums/statusEnum'
const findAllContractTypeOption = async ({ limit, tenantId, keyword }: ContractTypeOptionParams) => {
   try {
      let whereClause: any = { deleted: 0, status: RecordStatus.ACTIVE }
      if (tenantId) whereClause['tenant_id'] = tenantId

      if (keyword) whereClause[Op.or] = { name: { [Op.iLike]: `%${keyword}%` } }

      const { rows: results } = await ContractType.findAndCountAll({
         where: whereClause,
         limit,
         attributes: ['id', 'name', 'is_permanent'],
         order: [['name', 'ASC']]
      })

      const data = results.map(({ id, name, is_permanent }: any) => ({ id, name, is_permanent }))

      return { data }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findAllContractType = async ({
   page,
   limit,
   tenantId,
   keyword,
   sortBy = 'name',
   sortOrder = 'ASC',
   status,
   isPermanent
}: ContractTypeFindParams) => {
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

      if (isPermanent !== undefined) {
         whereClause.is_permanent = isPermanent
      }

      const contractTypes = await ContractType.findAll({
         where: whereClause,
         limit,
         offset,
         order: [[sortBy, sortOrder]],
         attributes: ['id', 'name', 'is_permanent', 'status', 'created_at', 'updated_at']
      })

      return contractTypes
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const findContractTypeById = async (id: string, tenantId?: string) => {
   try {
      const whereClause: any = {
         deleted: 0
      }

      if (id) {
         whereClause.id = id
      }

      if (tenantId) {
         whereClause.tenant_id = tenantId
      }

      const contractType = await ContractType.findOne({
         attributes: ['id', 'name', 'status', [fn('COUNT', col('contract.employee_id')), 'employee_count']],
         include: [
            {
               model: Contract,
               as: 'contract',
               attributes: []
            }
         ],
         where: whereClause,
         group: ['ContractType.id'],
         raw: true
      })

      return contractType
   } catch (err) {
      throw errorThrower(err)
   }
}

const createContractType = async (params: ContractTypeCreateParams) => {
   try {
      const { name, tenantId, isPermanent } = params

      if (!tenantId) {
         throw new Error('Tenant ID is required')
      }

      const isUnique = await isContractTypeNameUnique(name, tenantId);

      if (!isUnique) {
         throw new Error('Contract Type name already exists')
      }
      
      const contractType = await ContractType.create({ name, tenant_id: tenantId, is_permanent: Boolean(isPermanent) })
      return contractType
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const updateContractType = async (id: string, params: UpdateContractTypeParams) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: params.tenantId }
      }

      if (!params.tenantId) {
         throw new Error('Tenant ID is required')
      }

      const contractType = await ContractType.findOne(whereClause)
      if (!contractType) {
         throw new Error('Contract Type not found')
      }
      const { name, isPermanent, status, tenantId } = params

      if (name.trim().toLowerCase() !== contractType.name.trim().toLowerCase()) {
         const isUnique = await isContractTypeNameUnique(name, tenantId);
         if (!isUnique) {
            throw new Error('Contract Type name already exists');
         }
      }

      if (status) {
         if(status === "inactive") {
            const employee = await findContractTypeById(id, tenantId)
            const employeeCount = employee?.employee_count || 0
               if (employeeCount > 0) {
                  throw new BaseError({
                     status: 400,
                     message: `Cannot update status to inactive, because its already use by another employees` })
               }
            }
         contractType.status = status;
      }
      contractType.name = name
      contractType.is_permanent = isPermanent
      await contractType.save()
      return contractType
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const deleteContractType = async (id: string, tenantId: string) => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }
      const contractType = await ContractType.findOne(whereClause)

      if (!contractType) {
         throw new Error('Contract Type not found')
      }

      const findContractEmployee = await findContractTypeById(id, tenantId)
      const countEmployee = findContractEmployee?.employee_count || 0

      if (contractType.status.toLowerCase() === "active" && countEmployee > 0) {
         throw new BaseError({
            status: 400,
            message: `contract type cant be deleted because its already used by another employees`
         })
      }
      contractType.deleted = 1
      await contractType.save()
      return contractType
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const patchContractTypeStatus = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      const whereClause: any = {
         where: { id, deleted: 0, tenant_id: tenantId }
      }

      const contractType = await ContractType.findOne(whereClause)
      if (!contractType) {
         throw new Error('Contract Type not found')
      }

      if (status !== 'active' && status !== 'inactive') {
         throw new Error('Invalid status value')
      }

      contractType.status = status
      await contractType.save()
      return contractType
   } catch (err: any) {
      throw errorThrower(err)
   }
}

const isContractTypeNameUnique = async (name: string, tenantId: string) => {
   try {
      const contractType = await ContractType.findOne({
         where: {
            name: { [Op.iLike]: name.trim() },
            tenant_id: tenantId,
            deleted: 0
         }
      })
      return !contractType
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default {
   findAllContractTypeOption,
   createContractType,
   updateContractType,
   deleteContractType,
   findAllContractType,
   patchContractTypeStatus,
   findContractTypeById
}
