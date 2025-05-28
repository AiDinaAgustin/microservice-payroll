import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import { DepartmentOptionParams } from '@interfaces/department/departmentOptionParams'
import findDepartmentOptionService from '@services/departement/findDepartementOption'
import findAllDepartment from '@services/departement/findAllDepartment'
import createDepartmentService from '@services/departement/createDepartment'
import updateDepartmentService from '@services/departement/updateDepartment'
import DataTable from '@responses/DataTable'
import Department from '@models/Department'
import deleteDepartment from '@services/departement/deleteDepartment'
import findDepartmentById from '@services/departement/findDepartmentById'
import { DepartmentFindParams } from '@interfaces/department/departmentFindParams'
import patchDepartmentStatusService from '@services/departement/patchDepartmentService'

export const DepartmentFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, keyword } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: DepartmentOptionParams = {
         limit: Number(_limit),
         tenantId: String(tenantIdHeader),
         keyword: keyword ? String(keyword).toLowerCase() : undefined
      }
      const data = await findDepartmentOptionService(params)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department options found',
            data: data.data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const DepartmentFindAllController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, keyword, sortBy, sortOrder, status } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: DepartmentFindParams = {
         limit: Number(_limit),
         page: Number(_page),
         tenantId: String(tenantIdHeader),
         keyword: keyword ? String(keyword).toLowerCase() : undefined,
         sortBy: String(sortBy),
         sortOrder: String(sortOrder),
         status: status ? String(status) : undefined
      }

      const data = await findAllDepartment(params)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department found',
            data: new DataTable<Department>(data.data, data.data.length, Number(_page), Number(_limit))
         })
      )
   } catch (error) {
      next(error)
   }
}

export const DepartmentCreateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { name } = req.body
      const tenantIdHeader = req.headers['tenant-id'] as string
      const data = await createDepartmentService({ name, tenantId: tenantIdHeader })
      res.status(StatusCodes.CREATED).json(
         new BaseReponse({
            status: StatusCodes.CREATED,
            message: 'Department created successfully',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const DepartmentUpdateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = String(_id)
      const { name, status } = req.body
      const tenantIdHeader = req.headers['tenant-id'] as string

      const data = await updateDepartmentService(id, { name, tenantId: tenantIdHeader, status })
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department updated successfully',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const DepartmentDeleteController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = String(_id)
      const tenantIdHeader = req.headers['tenant-id'] as string
      const data = await deleteDepartment(id, tenantIdHeader)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department deleted successfully',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const DepartmentFindByIdController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const id = String(_id)
      const tenantIdHeader = req.headers['tenant-id'] as string
      const data = await findDepartmentById(id, tenantIdHeader)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department found',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const DepartmentPatchStatusController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const { status } = req.body
      const tenantIdHeader = req.headers['tenant-id'] as string

      if (status !== 'active' && status !== 'inactive') {
         throw new Error('Invalid status')
      }

      const data = await patchDepartmentStatusService(String(_id), tenantIdHeader, status)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Department status updated successfully',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}
