import { Request, Response, NextFunction } from 'express'
import { createAttendance, findAllAttendance, findAttendanceById, updateAttendance, deleteAttendance } from '@services/payroll/attendance.service'
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

    // Set default values and ensure they're valid numbers
    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 10;
    
    // Validate that they're positive numbers
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid page parameter'
      });
    }
    
    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid limit parameter'
      });
    }

    // Convert date strings to Date objects if provided
    const startDateObj = start_date ? new Date(start_date as string) : undefined;
    const endDateObj = end_date ? new Date(end_date as string) : undefined;

    const data = await findAllAttendance({ 
      tenantId,
      page: pageNumber,
      limit: limitNumber,
      employeeId: employee_id as string | undefined,
      startDate: startDateObj,
      endDate: endDateObj
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

export const updateAttendanceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    const payload = { ...req.body, tenant_id: tenantId }
    const data = await updateAttendance(id, tenantId, payload)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance updated successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const deleteAttendanceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    await deleteAttendance(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}