import contractTypeRepository from '../../repositories/contract-type/contractTypeRepository'
import errorThrower from '@utils/errorThrower'

const patchContractTypeStatusService = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      return await contractTypeRepository.patchContractTypeStatus(id, tenantId, status)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default patchContractTypeStatusService