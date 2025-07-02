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
 * Helper function to clear all department related cache for a tenant
 * Uses the scanIterator for cleaner async iteration
 */
async function clearDepartmentCache(tenantId: string) {
  try {
    const pattern = `department:*:${tenantId}:*`
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
    console.error('Error clearing department cache:', error)
  }
}

export const DepartmentFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit: _limit, page: _page, keyword } = req.query
    const tenantIdHeader = req.headers['tenant-id'] as string

    // Create cache key based on request parameters
    const cacheKey = `department:options:${tenantIdHeader}:${_limit || 'all'}:${keyword || 'all'}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Department options found (cached)',
          data: JSON.parse(cachedData).data
        })
      )
    }

    const params: DepartmentOptionParams = {
      limit: Number(_limit),
      tenantId: String(tenantIdHeader),
      keyword: keyword ? String(keyword).toLowerCase() : undefined
    }
    const data = await findDepartmentOptionService(params)

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Create cache key based on request parameters
    const cacheKey = `department:list:${tenantIdHeader}:${_limit || 'all'}:${_page || 'all'}:${keyword || 'all'}:${sortOrder || 'asc'}:${sortBy || 'id'}:${status || 'all'}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      const parsedData = JSON.parse(cachedData)
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Department found (cached)',
          data: new DataTable<Department>(parsedData.data, parsedData.data.length, Number(_page), Number(_limit))
        })
      )
    }

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

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Clear department cache for this tenant
    await clearDepartmentCache(tenantIdHeader)

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

    // Clear department cache for this tenant
    await clearDepartmentCache(tenantIdHeader)

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

    // Clear department cache for this tenant
    await clearDepartmentCache(tenantIdHeader)

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

    // Create cache key for department details
    const cacheKey = `department:detail:${tenantIdHeader}:${id}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Department found (cached)',
          data: JSON.parse(cachedData)
        })
      )
    }

    const data = await findDepartmentById(id, tenantIdHeader)

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Clear department cache for this tenant
    await clearDepartmentCache(tenantIdHeader)

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
