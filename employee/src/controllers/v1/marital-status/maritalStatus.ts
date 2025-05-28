import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import { MaritalStatusOptionParams } from '@interfaces/marital-status/maritalStatusOptionParams'
import findMaritalStatusOptionService from '@services/marital-status/findMaritalStatusOption'

export const MaritalStatusFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { limit: _limit, page: _page, keyword } = req.query

      const params: MaritalStatusOptionParams = {
         limit: Number(_limit),
         keyword: keyword ? String(keyword).toLowerCase() : undefined
      }

      const data = await findMaritalStatusOptionService(params)

      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Marital status options found',
            data: data.data
         })
      )
   } catch (err: any) {
      next(err)
   }
}
