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
    
    // Parse and fix date formats
    const payload = { ...req.body, tenant_id: tenantId }
    
    // Parse the date (DD-MM-YYYY to YYYY-MM-DD)
    if (payload.date) {
      const [day, month, year] = payload.date.split('-');
      payload.date = new Date(`${year}-${month}-${day}`);
    }
    
    // Parse check_in (DD-MM-YYYY HH:MM:SS to Date object)
    let checkInDate: Date | null = null;
    if (payload.check_in) {
      const [datePart, timePart] = payload.check_in.split(' ');
      const [day, month, year] = datePart.split('-');
      checkInDate = new Date(`${year}-${month}-${day}T${timePart}`);
      payload.check_in = checkInDate;
      
      // Automatically set status and late_minutes based on check_in time
      const checkInHour = checkInDate.getHours();
      const checkInMinute = checkInDate.getMinutes();
      
      // Convert to total minutes since 00:00
      const totalMinutes = (checkInHour * 60) + checkInMinute;
      const expectedTime = 8 * 60; // 08:00 in minutes
      
      if (totalMinutes <= expectedTime) {
        // On time or early
        payload.status = 'present';
        payload.late_minutes = 0;
      } else {
        // Late
        payload.status = 'late';
        payload.late_minutes = totalMinutes - expectedTime;
      }
      
      // Automatically set check_out to 16:00 on the same day
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(16, 0, 0, 0);
      payload.check_out = checkOutDate;
      
      console.log(`[ATTENDANCE] Auto-calculated: Status=${payload.status}, Late minutes=${payload.late_minutes}`);
    }
    
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
    const { page, limit, employee_id, month_year, keyword } = req.query

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

    // Calculate date range for filtering
    let startDate: Date, endDate: Date;
    
    if (month_year && typeof month_year === 'string' && /^\d{2}-\d{4}$/.test(month_year)) {
      // If month_year is provided in MM-YYYY format
      const [month, year] = month_year.split('-').map(Number);
      
      // Create start date (1st day of month)
      startDate = new Date(year, month - 1, 1);
      
      // Create end date (last day of month)
      endDate = new Date(year, month, 0);
    } else {
      // Default to current month if no valid month_year is provided
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const data = await findAllAttendance({ 
      tenantId,
      page: pageNumber,
      limit: limitNumber,
      employeeId: employee_id as string | undefined,
      startDate,
      endDate,
      keyword: keyword as string | undefined // Add keyword parameter
    });
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance list retrieved successfully',
      data: data.rows,
      total: data.count
    });
  } catch (err) {
    next(err);
  }
};

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
    
    // Parse and fix date formats
    const payload = { ...req.body, tenant_id: tenantId }
    
    // Parse the date (DD-MM-YYYY to YYYY-MM-DD)
    if (payload.date) {
      const [day, month, year] = payload.date.split('-');
      payload.date = new Date(`${year}-${month}-${day}`);
    }
    
    // Parse check_in (DD-MM-YYYY HH:MM:SS to Date object)
    let checkInDate: Date | null = null;
    if (payload.check_in) {
      const [datePart, timePart] = payload.check_in.split(' ');
      const [day, month, year] = datePart.split('-');
      checkInDate = new Date(`${year}-${month}-${day}T${timePart}`);
      payload.check_in = checkInDate;
      
      // Automatically set status and late_minutes based on check_in time
      const checkInHour = checkInDate.getHours();
      const checkInMinute = checkInDate.getMinutes();
      
      // Convert to total minutes since 00:00
      const totalMinutes = (checkInHour * 60) + checkInMinute;
      const expectedTime = 8 * 60; // 08:00 in minutes
      
      if (totalMinutes <= expectedTime) {
        // On time or early
        payload.status = 'present';
        payload.late_minutes = 0;
      } else {
        // Late
        payload.status = 'late';
        payload.late_minutes = totalMinutes - expectedTime;
      }
      
      // Automatically set check_out to 16:00 on the same day
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(16, 0, 0, 0);
      payload.check_out = checkOutDate;
      
      console.log(`[ATTENDANCE] Auto-calculated: Status=${payload.status}, Late minutes=${payload.late_minutes}`);
    }
    
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