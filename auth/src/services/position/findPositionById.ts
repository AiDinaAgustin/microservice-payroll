import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'

export const findPositionbyId = async (id: string, tenantId: string) => {
    try {
        return await positionRepository.findPositionById(id, tenantId)
    } catch (error) {
        throw errorThrower(error)
    }
}

export default findPositionbyId