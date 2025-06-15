import { Request, Response, NextFunction } from 'express'
import { createPayslip, findAllPayslip, findPayslipById, generatePayslipsForPeriod } from '@services/payroll/payslip.service'
import { StatusCodes } from 'http-status-codes'

export const createPayslipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const payload = { ...req.body, tenant_id: tenantId };
    const data = await createPayslip(payload);
    
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: 'Payslip created successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export const findAllPayslipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const { page, limit, employee_id, period, keyword } = req.query;

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

    // Default to current month-year if period not provided
    let periodValue = period as string;
    if (!periodValue || !/^\d{2}-\d{4}$/.test(periodValue)) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      periodValue = `${month}-${year}`;
    }

    const data = await findAllPayslip({ 
      tenantId,
      page: pageNumber,
      limit: limitNumber,
      employeeId: employee_id as string | undefined,
      period: periodValue,
      keyword: keyword as string | undefined // Add keyword parameter
    });
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Payslip list retrieved successfully',
      data: data.rows,
      total: data.count
    });
  } catch (err) {
    next(err);
  }
}

export const findPayslipByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const { id } = req.params;
    const data = await findPayslipById(id, tenantId);
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Payslip retrieved successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export const generatePayslipsController = async (req: Request, res: Response, next: NextFunction) => {
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
    
    const data = await generatePayslipsForPeriod(tenantId, period);
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Payslips generated successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}