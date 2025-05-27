import contractTypeRepository from '../../repositories/contract-type/contractTypeRepository'
import errorThrower from '@utils/errorThrower'
import { UpdateContractTypeParams } from '@interfaces/contract-type/UpdateContractTypeParams'
const logger = require('../../config/logger')

export const updateContractTypeService = async (id: string, params: UpdateContractTypeParams) => {
   try {
      logger.info('Update Contract Type Start', {
         context: `Update Contract Type Service`,
         request: {
            id: id,
            params: params
         }
      })

      const updatedContractType = await contractTypeRepository.updateContractType(id, params)

      logger.info('Update Contract Type Success', {
         context: `Update Contract Type Service`,
         response: updatedContractType
      })

      return updatedContractType
   } catch (err: any) {
      logger.error(`Update Contract Type Failed : ${err.message}`, {
         context: `Update Contract Type Service`,
         request: {
            id: id,
            params: params
         }
      })
      throw errorThrower(err)
   }
}

export default updateContractTypeService