import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'
import { PositionUpdateParams } from '@interfaces/position/positionUpdateParams'
const logger = require('../../config/logger')

const updatePositionService = async (id: string, params: PositionUpdateParams) => {
   try {
      logger.info('Update Position Start', {
         context: `Update Position Service`,
         request: {
            id: id,
            params: params
         }
      })

      const updatedPosition = await positionRepository.updatePosition(id, params)

      logger.info('Update Position Success', {
         context: `Update Position Service`,
         response: updatedPosition
      })

      return updatedPosition
   } catch (err: any) {
      logger.error(`Update Position Failed : ${err.message}`, {
         context: `Update Position Service`,
         request: {
            id: id,
            params: params
         }
      })
      throw errorThrower(err)
   }
}

export default updatePositionService