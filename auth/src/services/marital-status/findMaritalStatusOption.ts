import maritalStatusRepository from '../../repositories/marital-status/maritalStatusRepository'
import errorThrower from '@utils/errorThrower'
import { MaritalStatusOptionParams } from '@interfaces/marital-status/maritalStatusOptionParams'

const findMaritalStatusOptionService = async (params: MaritalStatusOptionParams) => {
   try {
      return await maritalStatusRepository.findAllMaritalStatusOption(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findMaritalStatusOptionService