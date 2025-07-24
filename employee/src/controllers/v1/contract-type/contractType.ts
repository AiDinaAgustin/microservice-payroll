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
import { createClient } from 'redis'

// Improved Redis client configuration with retry logic
const redisClient = createClient({
   url: process.env.REDIS_URL || 'redis://:641Fc2L3N79nJqYXGCawPgSRT8Dd5f0u@43.133.145.125:32624',
   socket: {
      //@ts-ignore
      reconnectStrategy: (retries) => {
         // Exponential backoff with max delay of 10 seconds
         const delay = Math.min(Math.pow(2, retries) * 100, 10000);
         console.log(`Redis reconnect attempt #${retries} in ${delay}ms`);
         return delay;
      },
      connectTimeout: 15000 // Increase timeout to 15 seconds
   }
}).on('error', (err: Error) => console.error('Redis Client Error:', err));

// Connect with proper error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let redisConnected = false;
redisClient.connect().then(() => {
   redisConnected = true;
   console.log('Redis connected successfully');
}).catch((err: Error) => {
   console.error('Redis connection failed, using memory cache:', err);
});

/**
 * Helper function to clear all contract type related cache for a tenant
 * Uses the scanIterator for cleaner async iteration
 */
async function clearContractTypeCache(tenantId: string) {
  try {
    const pattern = `contract-type:*:${tenantId}:*`
    const keys: string[] = []

    // Use scanIterator instead of manual cursor handling
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      // @ts-ignore
      keys.push(key)

      // Delete in batches of 100 to avoid large commands
      if (keys.length >= 100) {
        if (keys.length > 0) await redisClient.del(keys) // Pass keys array directly
        keys.length = 0
      }
    }

    // Delete any remaining keys
    if (keys.length > 0) await redisClient.del(keys) // Pass keys array directly

  } catch (error) {
    console.error('Error clearing contract type cache:', error)
  }
}

// Ini Pake redis
// export const ContractTypeFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
//    try {
//       const { limit: _limit, keyword } = req.query
//       const tenantIdHeader = req.headers['tenant-id'] as string

//       if (!tenantIdHeader) {
//          return res.status(StatusCodes.BAD_REQUEST).json({
//             status: StatusCodes.BAD_REQUEST,
//             message: 'Tenant ID is required in the request header'
//          })
//       }

//       // Create cache key based on request parameters
//       const cacheKey = `contract-type:options:${tenantIdHeader}:${_limit || 'all'}:${keyword || 'all'}`

//       // Try to get data from cache
//       const cachedData = await redisClient.get(cacheKey)

//       if (cachedData) {
//          // Return cached data if available
//          return res.status(StatusCodes.OK).json(
//             new BaseReponse({
//                status: StatusCodes.OK,
//                message: 'Contract Type options found (cached)',
//                data: JSON.parse(cachedData).data
//             })
//          )
//       }

//       const params: ContractTypeOptionParams = {
//          limit: Number(_limit),
//          tenantId: String(tenantIdHeader),
//          keyword: keyword ? String(keyword).toLowerCase() : undefined
//       }

//       // If not in cache, fetch from service
//       const data = await findContractTypeOptionService(params)

//       // Cache the result for 5 minutes (300 seconds)
//       await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

//       res.status(StatusCodes.OK).json(
//          new BaseReponse({
//             status: StatusCodes.OK,
//             message: 'Contract Type options found',
//             data: data.data
//          })
//       )
//    } catch (err: any) {
//       next(err)
//    }
// }

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
         tenantId: tenantIdHeader
      }

      const data = await createContractType(request);

      // Clear all contract type cache for this tenant
      await clearContractTypeCache(tenantIdHeader)

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

// Ini redis
// export const ContractTypeFindAllController = async (req: Request, res: Response, next: NextFunction) => {
//    try {
//       const { limit: _limit, page: _page, keyword, sortOrder, sortBy, status, isPermanent } = req.query
//       const tenantIdHeader = req.headers['tenant-id'] as string

//       // Create cache key based on request parameters
//       const cacheKey = `contract-type:list:${tenantIdHeader}:${_limit || 'all'}:${_page || 'all'}:${keyword || 'all'}:${sortOrder || 'asc'}:${sortBy || 'id'}:${status || 'all'}:${isPermanent !== undefined ? isPermanent : 'all'}`

//       // Try to get data from cache
//       const cachedData = await redisClient.get(cacheKey)

//       if (cachedData) {
//          // Return cached data if available
//          const parsedData = JSON.parse(cachedData)
//          return res.status(StatusCodes.OK).json(
//             new BaseReponse({
//                status: StatusCodes.OK,
//                message: 'Contract Type found (cached)',
//                data: new DataTable<ContractType>(parsedData, parsedData.length, Number(_page), Number(_limit))
//             })
//          )
//       }

//       const params: ContractTypeFindParams = {
//          limit: Number(_limit),
//          page: Number(_page),
//          tenantId: String(tenantIdHeader),
//          keyword: keyword ? String(keyword).toLowerCase() : undefined,
//          sortBy: String(sortBy),
//          sortOrder: String(sortOrder),
//          status: status ? String(status) : undefined,
//          isPermanent: isPermanent !== undefined ? isPermanent === 'true' : undefined
//       }

//       // If not in cache, fetch from service
//       const data = await findAllContractTypeService(params)

//       // Cache the result for 5 minutes (300 seconds)
//       await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

//       res.status(StatusCodes.OK).json(
//          new BaseReponse({
//             status: StatusCodes.OK,
//             message: 'Contract Type found',
//             data: new DataTable<ContractType>(data, data.length, Number(_page), Number(_limit))
//          })
//       )
//    } catch (err: any) {
//       next(err)
//    }
// }

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

      // Clear all contract type cache for this tenant
      await clearContractTypeCache(tenantIdHeader)

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

      // Clear all contract type cache for this tenant
      await clearContractTypeCache(tenantIdHeader)

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

      // Clear all contract type cache for this tenant
      await clearContractTypeCache(tenantIdHeader)

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
