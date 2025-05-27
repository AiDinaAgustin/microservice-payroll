import { IPayslip } from '@interfaces/payroll/IPayslip'
import payslipRepository from '../../repositories/payroll/payslip.repository'
import errorThrower from '@utils/errorThrower'

export const createPayslip = async (payload: IPayslip) => {
  try {
    return await payslipRepository.create(payload)
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findAllPayslip = async (params: any) => {
  try {
    return await payslipRepository.findAll(params)
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findPayslipById = async (id: string, tenantId: string) => {
  try {
    const payslip = await payslipRepository.findById(id, tenantId)
    if (!payslip) throw new Error('Payslip not found')
    return payslip
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findPayslipByEmployeeId = async (employeeId: string, tenantId: string) => {
  try {
    return await payslipRepository.findByEmployeeId(employeeId, tenantId)
  } catch (err: any) {
    throw errorThrower(err)
  }
}