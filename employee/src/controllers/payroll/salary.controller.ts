import { Request, Response, NextFunction } from 'express'
import { createSalary, findAllSalary, findSalaryById } from '@services/payroll/salary.service'
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
    const { page, limit, employee_id } = req.query

    const data = await findAllSalary({ 
      tenantId,
      page: Number(page),
      limit: Number(limit),
      employeeId: employee_id
    })
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Salary list retrieved successfully',
      data: data.rows,
      total: data.count
    })
  } catch (err) {
    next(err)
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