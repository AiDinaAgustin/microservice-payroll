import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'
import { PositionOptionParams } from '@interfaces/position/positionOptionParams'

const findPositionOptionService = async (params: PositionOptionParams) => {
   try {
      return await positionRepository.findAllPositionOption(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findPositionOptionService
