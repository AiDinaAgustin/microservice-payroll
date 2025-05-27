import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'
import { DepartmentFindParams } from '@interfaces/department/departmentFindParams'

const findDepartmentService = async (params: DepartmentFindParams) => {
   try {
      return await departementRepository.findAllDepartment(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findDepartmentService
