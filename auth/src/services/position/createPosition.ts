import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'
import { PositionUpdateParams } from '@interfaces/position/positionUpdateParams';

const createPositionService = async (params: PositionUpdateParams) => {
   try {
      return await positionRepository.createPosition(params);
   } catch (err: any) {
      throw errorThrower(err);
   }
}

export default createPositionService;