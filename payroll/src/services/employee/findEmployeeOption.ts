import employeeRepository from '../../repositories/employee/employee'
import errorThrower from '@utils/errorThrower'
import { EmployeeOptionParams } from '@interfaces/EmployeeSearchParams'

const findEmployeeOptionService = async (params: EmployeeOptionParams) => {
   try {
      return await employeeRepository.findAllEmployeeOption(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findEmployeeOptionService
