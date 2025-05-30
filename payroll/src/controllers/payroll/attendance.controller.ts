import { Request, Response, NextFunction } from 'express'
import { createAttendance, findAllAttendance, findAttendanceById } from '@services/payroll/attendance.service'
import { StatusCodes } from 'http-status-codes'

export const createAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const payload = { ...req.body, tenant_id: tenantId }
    const data = await createAttendance(payload)
    
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: 'Attendance created successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const findAllAttendanceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { page, limit, employee_id, start_date, end_date } = req.query

    const data = await findAllAttendance({ 
      tenantId,
      page: Number(page),
      limit: Number(limit),
      employeeId: employee_id,
      startDate: start_date,
      endDate: end_date
    })
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance list retrieved successfully',
      data: data.rows,
      total: data.count
    })
  } catch (err) {
    next(err)
  }
}

export const findAttendanceByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    const data = await findAttendanceById(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance retrieved successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}