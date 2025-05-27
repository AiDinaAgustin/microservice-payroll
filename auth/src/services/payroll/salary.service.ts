import { ISalary } from '@interfaces/payroll/ISalary'
import salaryRepository from '../../repositories/payroll/salary.repository'
import errorThrower from '@utils/errorThrower'

export const createSalary = async (payload: ISalary) => {
  try {
    return await salaryRepository.create(payload)
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findAllSalary = async (params: any) => {
  try {
    return await salaryRepository.findAll(params)
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findSalaryById = async (id: string, tenantId: string) => {
  try {
    const salary = await salaryRepository.findById(id, tenantId)
    if (!salary) throw new Error('Salary not found')
    return salary
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findSalaryByEmployeeId = async (employeeId: string, tenantId: string) => {
  try {
    return await salaryRepository.findByEmployeeId(employeeId, tenantId)
  } catch (err: any) {
    throw errorThrower(err)
  }
}