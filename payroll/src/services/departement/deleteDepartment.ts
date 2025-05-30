import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'

export const deleteDepartment = async (id: string, tenantId: string) => {
    try {
        return await departementRepository.deleteDepartment(id, tenantId)
    } catch (error) {
        throw errorThrower(error)
    }
}

export default deleteDepartment