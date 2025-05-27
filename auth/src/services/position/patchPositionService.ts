import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'

const patchPositionStatusService = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      return await positionRepository.patchPositionStatus(id, tenantId, status)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default patchPositionStatusService