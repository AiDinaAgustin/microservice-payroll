import employeeRepository from '../../repositories/employee/employee'

const findEmployeeById = async (id: string) => {
    return await employeeRepository.findEmployeeById(id)
}

export default  findEmployeeById 
