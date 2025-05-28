import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import { PositionOptionParams } from '@interfaces/position/positionOptionParams'
import findPositionOptionService from '@services/position/findPositionOption'
import createPositionService from '@services/position/createPosition'
import findAllPositionService from '@services/position/findAllPosition'
import updatePositionService from '@services/position/updatePosition'
import { PositionCreateParams } from '@interfaces/position/positionCreateParams'
import Position from '@models/Position'
import DataTable from '@responses/DataTable'
import deletePosition from '@services/position/deletePosition'
import findPositionbyId from '@services/position/findPositionById'
import { PositionFindParams } from '@interfaces/position/positionFindParams'
import patchPositionStatusService from '@services/position/patchPositionService'
import Employee from '@models/Employee'

export const PositionFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, departmentId: _departmentId, keyword } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: PositionOptionParams = {
         limit: Number(_limit),
         tenantId: String(tenantIdHeader),
         departmentId: _departmentId ? String(_departmentId) : undefined,
         keyword: keyword ? String(keyword).toLowerCase() : undefined
      }

      const data = await findPositionOptionService(params)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position options found',
            data: data.data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const createPositionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { name, departmentId } = req.body;
      const tenantId = req.headers['tenant-id'] as string;

      const params: PositionCreateParams = {
         name,
         tenantId,
         departmentId
      };

      const position = await createPositionService(params);

      res.status(StatusCodes.CREATED).json(
         new BaseReponse({
            status: StatusCodes.CREATED,
            message: 'Position created successfully',
            data: position
         })
      );
   } catch (err: any) {
      next(err);
   }
}

export const findAllPositionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, departmentId: _departementId, keyword, sortBy, sortOrder, status } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: PositionFindParams = {
         limit: Number(_limit),
         page: Number(_page),
         tenantId: String(tenantIdHeader),
         departmentId: _departementId ? String(_departementId) : undefined,
         keyword: keyword ? String(keyword).toLowerCase() : undefined,
         sortBy: String(sortBy),
         sortOrder: String(sortOrder),
         status: status ? String(status) : undefined
      }

      const data = await findAllPositionService(params)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position found',
            data: new DataTable<Position>(data.data, data.data.length, Number(_page), Number(_limit))
         })
      )
   } catch (error) {
      next(error)
   }
}

export const updatePositionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params;
      const id = String(_id);
      const { name, departmentId, status } = req.body;
      const tenantIdHeader = req.headers['tenant-id'] as string;

      const data = await updatePositionService(id, { name, tenantId: tenantIdHeader, departmentId, status });
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position updated successfully',
            data: data
         })
      );
   } catch (error) {
      next(error);
   }
}


export const DeletePositionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params;
      const tenantIdHeader = req.headers['tenant-id'] as string;
      const data = await deletePosition(String(_id), tenantIdHeader);
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position deleted successfully',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}

export const PositionFindByIdController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params;
      const tenantIdHeader = req.headers['tenant-id'] as string;
      const data = await findPositionbyId(String(_id), tenantIdHeader);
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position found successfully',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}

export const patchPositionStatusController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { id: _id } = req.params
      const { status } = req.body
      const tenantIdHeader = req.headers['tenant-id'] as string

      if (status !== 'active' && status !== 'inactive') {
         throw new Error('Invalid status value')
      }

      const data = await patchPositionStatusService(String(_id), tenantIdHeader, status)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Position status updated successfully',
            data: data
         })
      )
   } catch (error) {
      next(error)
   }
}