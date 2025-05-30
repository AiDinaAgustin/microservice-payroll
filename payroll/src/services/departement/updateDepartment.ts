import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'
import { DepartmentUpdateParams } from '@interfaces/department/departmentUpdateParams'
const logger = require('../../config/logger')

export const updateDepartment = async (id: string, params: DepartmentUpdateParams) => {
    try {
        logger.info('Update Department Start', {
            context: `Update Department Service`,
            request: {
                id: id,
                params: params
            }
        })

        const updatedDepartment = await departementRepository.updateDepartment(id, params)

        logger.info('Update Department Success', {
            context: `Update Department Service`,
            response: updatedDepartment
        })

        return updatedDepartment
    } catch (error: any) {
        logger.error(`Update Department Failed : ${error.message}`, {
            context: `Update Department Service`,
            request: {
                id: id,
                params: params
            }
        })
        throw errorThrower(error)
    }
}

export default updateDepartment