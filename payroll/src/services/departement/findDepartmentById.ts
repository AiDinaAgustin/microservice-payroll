import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'

export const findDepartmentById = async (id: string, tenantId: string) => {
    try {
        return await departementRepository.findDepartmentById(id, tenantId)
    } catch (error) {
        throw errorThrower(error)
    }
}

export default findDepartmentById