import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'
import { DepartmentCreateParams } from '@interfaces/department/departmentCreateParams'

export const createDepartment = async (params: DepartmentCreateParams) => {
    try {
        return await departementRepository.createDepartment(params)
    } catch (err: any) {
        throw errorThrower(err)
    }
}

export default createDepartment