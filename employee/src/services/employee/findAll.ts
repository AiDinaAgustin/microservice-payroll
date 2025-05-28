import employeeRepository from '../../repositories/employee/employee'
import errorThrower from '@utils/errorThrower'
import { EmployeeSearchParams } from '@interfaces/EmployeeSearchParams'

const searchEmployeeService = async (params: EmployeeSearchParams) => {
   try {
      return await employeeRepository.findAllEmployees(params)
   } catch (err: any) {
      throw errorThrower(err)
   }
}


export default searchEmployeeService