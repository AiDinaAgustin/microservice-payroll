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
import { createClient } from "redis"

// Create Redis client with better error handling
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://:4oFzHb5Ag7WhN3fPUD2nKket19a06y8T@43.133.145.125:31241'
})
  .on('error', (err: Error) => console.error('Redis Client Error:', err))

// Connect to Redis only once at startup
redisClient.connect().catch((err: Error) => {
  console.error('Redis connection error:', err)
})

/**
 * Helper function to clear all position related cache for a tenant
 * Uses the scanIterator for cleaner async iteration
 */
async function clearPositionCache(tenantId: string) {
  try {
    const pattern = `position:*:${tenantId}:*`
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
    console.error('Error clearing position cache:', error)
  }
}

export const PositionFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit: _limit, page: _page, departmentId: _departmentId, keyword } = req.query
    const tenantIdHeader = req.headers['tenant-id'] as string

    // Create cache key based on request parameters
    const cacheKey = `position:options:${tenantIdHeader}:${_limit || 'all'}:${_departmentId || 'all'}:${keyword || 'all'}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Position options found (cached)',
          data: JSON.parse(cachedData).data
        })
      )
    }

    const params: PositionOptionParams = {
      limit: Number(_limit),
      tenantId: String(tenantIdHeader),
      departmentId: _departmentId ? String(_departmentId) : undefined,
      keyword: keyword ? String(keyword).toLowerCase() : undefined
    }

    const data = await findPositionOptionService(params)

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Clear position cache for this tenant
    await clearPositionCache(tenantId)

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

    // Create cache key based on request parameters
    const cacheKey = `position:list:${tenantIdHeader}:${_limit || 'all'}:${_page || 'all'}:${_departementId || 'all'}:${keyword || 'all'}:${sortOrder || 'asc'}:${sortBy || 'id'}:${status || 'all'}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      const parsedData = JSON.parse(cachedData)
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Position found (cached)',
          data: new DataTable<Position>(parsedData.data, parsedData.data.length, Number(_page), Number(_limit))
        })
      )
    }

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

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Clear position cache for this tenant
    await clearPositionCache(tenantIdHeader)

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

    // Clear position cache for this tenant
    await clearPositionCache(tenantIdHeader)

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

    // Create cache key for position details
    const cacheKey = `position:detail:${tenantIdHeader}:${_id}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Position found successfully (cached)',
          data: JSON.parse(cachedData)
        })
      )
    }

    const data = await findPositionbyId(String(_id), tenantIdHeader);

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

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

    // Clear position cache for this tenant
    await clearPositionCache(tenantIdHeader)

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
