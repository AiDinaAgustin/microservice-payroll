import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import { ContractTypeOptionParams } from '@interfaces/contract-type/contractTypeOptionParams'
import findContractTypeOptionService from '@services/contract-type/findContractTypeOption'
import createContractType from '@services/contract-type/createContractType'
import DataTable from '@responses/DataTable'
import ContractType from '@models/ContractType'
import findAllContractTypeService from '@services/contract-type/findAllContractType'
import updateContractTypeService from '@services/contract-type/updateContractType'
import deleteContractTypeService from '@services/contract-type/deleteContractType'
import { ContractTypeCreateParams } from '@interfaces/contract-type/ContractTypeCreateParams'
import { ContractTypeFindParams } from '@interfaces/contract-type/contractTypeFindParams'
import patchContractTypeStatusService from '@services/contract-type/patchContractTypeStatus'

export const ContractTypeFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, keyword } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      if (!tenantIdHeader) {
         return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: 'Tenant ID is required in the request header'
         })
      } else {
         const params: ContractTypeOptionParams = {
            limit: Number(_limit),
            tenantId: String(tenantIdHeader),
            keyword: keyword ? String(keyword).toLowerCase() : undefined
         }
         const data = await findContractTypeOptionService(params)
         res.status(StatusCodes.OK).json(
            new BaseReponse({
               status: StatusCodes.OK,
               message: 'Contract Type options found',
               data: data.data
            })
         )
      }
   } catch (err: any) {
      next(err)
   }
}

export const ContractTypeCreateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { name, is_permanent } = req.body;
      const tenantIdHeader = req.headers['tenant-id'] as string

      const request: ContractTypeCreateParams = {
         name: name,
         isPermanent: is_permanent,
         tenantId:  tenantIdHeader
      }

      const data = await createContractType(request);
      res.status(StatusCodes.CREATED).json(
         new BaseReponse({
            status: StatusCodes.CREATED,
            message: 'Contract Type created',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}

export const ContractTypeFindAllController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, keyword, sortOrder, sortBy, status, isPermanent } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: ContractTypeFindParams = {
         limit: Number(_limit),
         page: Number(_page),
         tenantId: String(tenantIdHeader),
         keyword: keyword ? String(keyword).toLowerCase() : undefined,
         sortBy: String(sortBy),
         sortOrder: String(sortOrder),
         status: status ? String(status) : undefined,
         isPermanent: isPermanent !== undefined ? isPermanent === 'true' : undefined // Ubah menjadi boolean
      }

      const data = await findAllContractTypeService(params)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Contract Type found',
            data: new DataTable<ContractType>(data, data.length, Number(_page), Number(_limit))
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const ContractTypeUpdateController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params;
      const id = String(_id);
      const { name, is_permanent, status } = req.body;
      const tenantIdHeader = req.headers['tenant-id'] as string
      const data = await updateContractTypeService(id, { name, tenantId: tenantIdHeader, isPermanent: is_permanent, status })
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Contract Type updated',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const ContractTypeDeleteController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params;
      const id = String(_id);
      const tenantIdHeader = req.headers['tenant-id'] as string

      const data = await deleteContractTypeService(id, tenantIdHeader)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Contract Type deleted',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const ContractTypePatchStatusController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const { status } = req.body
      const tenantIdHeader = req.headers['tenant-id'] as string

      const data = await patchContractTypeStatusService(String(_id), tenantIdHeader, status)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Contract Type status updated successfully',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}
