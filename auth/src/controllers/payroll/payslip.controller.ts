import { Request, Response, NextFunction } from 'express'
import { createPayslip, findAllPayslip, findPayslipById } from '@services/payroll/payslip.service'
import { StatusCodes } from 'http-status-codes'

export const createPayslipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const payload = { ...req.body, tenant_id: tenantId }
    const data = await createPayslip(payload)
    
    res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: 'Payslip created successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const findAllPayslipController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { page, limit, employee_id, period } = req.query

    const data = await findAllPayslip({ 
      tenantId,
      page: Number(page),
      limit: Number(limit),
      employeeId: employee_id,
      period
    })
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Payslip list retrieved successfully',
      data: data.rows,
      total: data.count
    })
  } catch (err) {
    next(err)
  }
}

export const findPayslipByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['tenant-id'] as string
    const { id } = req.params
    const data = await findPayslipById(id, tenantId)
    
    res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: 'Payslip retrieved successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}