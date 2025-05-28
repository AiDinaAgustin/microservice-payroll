import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'
import { PositionOptionParams } from '@interfaces/position/positionOptionParams'
import { PositionFindParams } from '@interfaces/position/positionFindParams'

const findAllPositionService = async (params: PositionFindParams) => {
   try {
      return await positionRepository.findAllPosition(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findAllPositionService;