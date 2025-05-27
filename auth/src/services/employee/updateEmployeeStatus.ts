import Employee from '@models/Employee'
import errorThrower from '@utils/errorThrower'
import employeeRepository from '../../repositories/employee/employee'


const updateEmployeeStatus = async (id: string, status: string) => {
    return await employeeRepository.updateEmployeeStatus(id, status)
}

export default updateEmployeeStatus
