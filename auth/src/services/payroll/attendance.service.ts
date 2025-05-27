import { IAttendance } from '@interfaces/payroll/IAttendance'
import attendanceRepository from '../../repositories/payroll/attendance.repository'
import errorThrower from '@utils/errorThrower'

export const createAttendance = async (payload: IAttendance) => {
  try {
    return await attendanceRepository.create(payload)
  } catch (err: any) {
    throw errorThrower(err)
  }
}

export const findAllAttendance = async (params: any) => {
    try {
      return await attendanceRepository.findAll(params)
    } catch (err: any) {
      throw errorThrower(err)
    }
  }
  
  export const findAttendanceById = async (id: string, tenantId: string) => {
    try {
      const attendance = await attendanceRepository.findById(id, tenantId)
      if (!attendance) throw new Error('Attendance not found')
      return attendance
    } catch (err: any) {
      throw errorThrower(err)
    }
  }
  
  export const findAttendanceByEmployeeId = async (employeeId: string, tenantId: string) => {
    try {
      return await attendanceRepository.findByEmployeeId(employeeId, tenantId)
    } catch (err: any) {
      throw errorThrower(err)
    }
  }