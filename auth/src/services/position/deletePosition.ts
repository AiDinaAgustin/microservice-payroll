import positionRepository from '../../repositories/position/positionRepository'
import errorThrower from '@utils/errorThrower'

export const deletePosition = async (id: string, tenantId: string) => {
    try {
        return await positionRepository.deletePosition(id, tenantId)
    } catch (error) {
        throw errorThrower(error)
    }
}

export default deletePosition