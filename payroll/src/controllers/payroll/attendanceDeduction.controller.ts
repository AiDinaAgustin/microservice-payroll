import { Request, Response, NextFunction } from 'express'
import { 
  createOrUpdateDeduction, 
  findAllDeductions, 
  findDeductionById, 
  deleteDeduction,
  generateDeductionsForPeriod
} from '@services/payroll/attendanceDeduction.service'
import { StatusCodes } from 'http-status-codes'

export const calculateDeductionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { employee_id, period } = req.body
    
    const data = await createOrUpdateDeduction(employee_id, tenantId, period)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deduction calculated successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const findAllDeductionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { page, limit, employee_id, period } = req.query

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

    // Get period parameter or default to current month-year
    let periodValue: string | undefined = period as string;
    
    if (!periodValue || !/^\d{2}-\d{4}$/.test(periodValue)) {
      // Default to current month-year if not provided or invalid
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      periodValue = `${month}-${year}`;
    }

    const data = await findAllDeductions({ 
      tenantId,
      page: pageNumber,
      limit: limitNumber,
      employeeId: employee_id as string | undefined,
      period: periodValue
    });
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deductions retrieved successfully',
      data: data.rows,
      total: data.count
    });
  } catch (err) {
    next(err);
  }
}

export const findDeductionByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    const data = await findDeductionById(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deduction retrieved successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const deleteDeductionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    await deleteDeduction(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deduction deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}

export const generateDeductionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const { period } = req.body;
    
    // Validate period format
    if (!period || !/^\d{2}-\d{4}$/.test(period)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'Period must be in MM-YYYY format'
      });
    }
    
    const data = await generateDeductionsForPeriod(tenantId, period);
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Attendance deductions generated successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}