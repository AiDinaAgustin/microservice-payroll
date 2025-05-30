import departementRepository from '../../repositories/departement/departementRepository'
import errorThrower from '@utils/errorThrower'
import { DepartmentOptionParams } from '@interfaces/department/departmentOptionParams'

const findDepartmentOptionService = async (params: DepartmentOptionParams) => {
   try {
      return await departementRepository.findAllDepartmentOption(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findDepartmentOptionService