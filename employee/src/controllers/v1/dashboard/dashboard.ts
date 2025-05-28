import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BaseReponse } from '@responses/BaseResponse'
import { DashboardFindParams } from '@interfaces/dashboard/dashboardParams'
import findAllInsight from '@services/dashboard/findInsight'
import {
   EmployeeEndContractParams,
   EmployeeWhatsOnTodayParams
} from '@interfaces/EmployeeSearchParams'
import findEmployeeContractEndSoon from '@services/employee/findContractEndSoon'
import whatsOnTodayService from '@services/dashboard/whatson'

export const DashboardFindInsightController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const {
         byDate: _byDate,
         byMonth: _byMonth,
         byYear: _byYear,
         byQuarter: _byQuarter,
         startDate: _startDate,
         endDate: _endDate
      } = req.query
      const tenantIdHeader = req.headers['tenant-id'] as string

      const params: DashboardFindParams = {
         tenantId: String(tenantIdHeader),
         byDate: _byDate ? String(_byDate) : undefined,
         byMonth: _byMonth ? String(_byMonth) : undefined,
         byYear: _byYear ? String(_byYear) : undefined,
         byQuarter: _byQuarter ? String(_byQuarter) : undefined,
         startDate: _startDate ? String(_startDate) : undefined,
         endDate: _endDate ? String(_endDate) : undefined
      }
      const data = await findAllInsight(params)
      res.status(StatusCodes.OK).json(
         new BaseReponse({
            status: StatusCodes.OK,
            message: 'Insight data found',
            data: data
         })
      )
   } catch (err: any) {
      next(err)
   }
}

export const WhatsOnTodayController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const tenantId = req.headers['tenant-id'] as string
      const { position, isOnleave, isBirthDate } = req.query

      const params: EmployeeWhatsOnTodayParams = {
         tenant_id: tenantId,
         position: position ? String(position).split(',') : undefined,
         isOnleave: isOnleave === 'true',
         isBirthDate: isBirthDate === 'true'
      }

      if (params.isOnleave && params.isBirthDate) {
         return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            message: "Only one filter can be applied at a time: 'isOnleave' or 'isBirthDate'."
         })
      }

      const result = await whatsOnTodayService(params)

      res.status(StatusCodes.OK).json({
         status: StatusCodes.OK,
         message: 'Filtered data retrieved successfully',
         data: result
      })
   } catch (err) {
      next(err)
   }
}

export const DashboardFindAllByContractEndSoonController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const tenantId = req.headers['tenant-id'] as string
      const params: EmployeeEndContractParams = {
         tenant_id: tenantId
      }
      const { data } = await findEmployeeContractEndSoon(params)
      return res.status(200).json({
         data: {
            content: data
         }
      })
   } catch (err: any) {
      next(err)
   }
}
