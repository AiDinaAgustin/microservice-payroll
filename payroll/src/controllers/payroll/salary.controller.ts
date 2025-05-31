import { Request, Response, NextFunction } from 'express'
import { createSalary, findAllSalary, findSalaryById, updateSalary, deleteSalary } from '@services/payroll/salary.service'
import { StatusCodes } from 'http-status-codes'

export const createSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const payload = { ...req.body, tenant_id: tenantId }
    const data = await createSalary(payload)
    
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: 'Salary created successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const findAllSalaryController = async (req: Request, res: Response, next: NextFunction) => {
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

    const data = await findAllSalary({ 
      tenantId,
      page: pageNumber,
      limit: limitNumber,
      employeeId: employee_id as string | undefined,
      period: periodValue
    });
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Salary list retrieved successfully',
      data: data.rows,
      total: data.count
    });
  } catch (err) {
    next(err);
  }
}

export const findSalaryByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    const data = await findSalaryById(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Salary retrieved successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const updateSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const { id } = req.params;
    const payload = { ...req.body, tenant_id: tenantId };
    
    const data = await updateSalary(id, tenantId, payload);
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Salary updated successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export const deleteSalaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string;
    const { id } = req.params;
    
    await deleteSalary(id, tenantId);
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Salary deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}