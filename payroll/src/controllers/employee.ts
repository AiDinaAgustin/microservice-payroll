import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import DataTable from '@responses/DataTable'
import Employee from '@models/Employee'
import findAllEmployees from '@services/employee/findAll'
import findEmployeeById from '@services/employee/findById'
import createEmployee from '@services/employee/create'
import updateEmployee from '@services/employee/update'
import deleteEmployee from '@services/employee/delete'
import {EmployeeOptionParams, EmployeeSearchParams } from '@interfaces/EmployeeSearchParams'
import updateEmployeeStatus from '@services/employee/updateEmployeeStatus'
import findEmployeeOptionService from '@services/employee/findEmployeeOption'
import { EmployeeCreateParams } from '@interfaces/EmployeeCreateParams'
import { UpdateEmployeeRequest } from '@interfaces/employee/UpdateEmployeeRequest'

export const EmployeeFindAllController = async (req: Request, res: Response, next: NextFunction) => {
   try {

      const tenantIdHeader = req.headers['tenant-id'] as string
      if (!tenantIdHeader) {
         return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: 'Tenant ID is required in the request header'
         })
      }
      const {
         limit: _limit,
         page: _page,
         keyword,
         position,
         department,
         contractType,
         status,
         sortBy,
         sortOrder
      } = req.query

      const params: EmployeeSearchParams = {
         tenantId: tenantIdHeader,
         limit: Number(_limit),
         page: Number(_page),
         keyword: keyword ? String(keyword).toLowerCase() : undefined,
         position: position ? String(position).split(',') : undefined,
         department: department ? String(department).split(',') : undefined,
         contractType: contractType ? String(contractType).split(',') : undefined,
         status: status ? String(status).split(',') : undefined,
         sortBy: sortBy ? (String(sortBy) as 'name' | 'status') : undefined,
         sortOrder: sortOrder ? (String(sortOrder) as 'ASC' | 'DESC') : undefined
      }
      const { data, total } = await findAllEmployees(params)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Employees found',
            data: new DataTable<Employee>(data, total, params.page, params.limit)
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const EmployeeFindByIdController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = String(_id)
      const data = await findEmployeeById(id)
      res.status(StatusCodes.OK).json(new BaseReponse({ status: StatusCodes.OK, message: 'Employee found', data }))
   } catch (err: any) {
      next(err)
   }
}

export const updateEmployeeStatusController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
         return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: 'Status is required'
         })
      }

      const updatedEmployee = await updateEmployeeStatus(id, status)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Employee status updated successfully',
            data: updatedEmployee
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const EmployeeCreateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const tenantIdHeader = req.headers['tenant-id'] as string
      const payload: EmployeeCreateParams = { ...req.body, tenant_id: tenantIdHeader }
      const data = await createEmployee(payload)
      res.status(StatusCodes.CREATED).json(
         new BaseReponse({ status: StatusCodes.CREATED, message: 'Employee created successfully', data })
      )
   } catch (err: any) {
      next(err)
   }
}

export const EmployeeUpdateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = String(_id)
      const tenantIdHeader = req.headers['tenant-id'] as string

      const {
         nik,
         name,
         employee_id,
         email,
         status,
         npwp,
         phone_number,
         address,
         birth_date,
         gender,
         marital_status_id,
         medical_condition,
         emergency_contact,
         position_id,
         department_id,
         manager_id,
         supervisor_id,
         team_lead_id,
         mentor_id,
         contract_type_id,
         start_date,
         end_date,
         image_url
      } = req.body

      const request: UpdateEmployeeRequest = {
         employee_id,
         name,
         status,
         nik,
         address,
         birth_date,
         gender,
         marital_status_id,
         npwp,
         email,
         phone_number,
         emergency_contact,
         position_id,
         manager_id,
         department_id,
         supervisor_id,
         team_lead_id,
         mentor_id,
         medical_condition,
         contract_type_id,
         start_date,
         end_date,
         image_url
      }
      const data = await updateEmployee(id, String(tenantIdHeader), request)
      res.status(StatusCodes.OK).json(
         new BaseReponse({ status: StatusCodes.OK, message: 'Employee updated successfully', data })
      )
   } catch (err: any) {
      next(err)
   }
}

export const EmployeeDeleteController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = Number(_id)
      await deleteEmployee(id)
      res.status(StatusCodes.OK).json(
         new BaseReponse({ status: StatusCodes.OK, message: 'Employee deleted successfully' })
      )
   } catch (err: any) {
      next(err)
   }
}

export const EmployeeFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const {
         limit: _limit,
         page: _page,
         keyword,
         employeeId: _employeeId,
         managerId: _managerId,
         supervisorId: _supervisorId,
         mentorId: _mentorId,
         leadId: _leadId
      } = req.query

      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: EmployeeOptionParams = {
         tenantId: String(tenantIdHeader),
         limit: Number(_limit),
         keyword: keyword ? String(keyword).toLowerCase() : undefined,
         employeeId: _employeeId ? String(_employeeId) : undefined,
         managerId: _managerId ? String(_managerId) : undefined,
         supervisorId: _supervisorId ? String(_supervisorId) : undefined,
         mentorId: _mentorId ? String(_mentorId) : undefined,
         leadId: _leadId ? String(_leadId) : undefined
      }

      const data = await findEmployeeOptionService(params)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Employee options found',
            data: data.data
         })
      )
   } catch (err: any) {
      next(err)
   }
}


