import contractTypeRepository from '../../repositories/contract-type/contractTypeRepository'
import errorThrower from '@utils/errorThrower'
import { ContractTypeOptionParams } from '@interfaces/contract-type/contractTypeOptionParams'

const findContractTypeOptionService = async (params: ContractTypeOptionParams) => {
   try {
      return await contractTypeRepository.findAllContractTypeOption(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findContractTypeOptionService
