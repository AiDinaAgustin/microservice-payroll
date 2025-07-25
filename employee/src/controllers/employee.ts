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
import { EmployeeOptionParams, EmployeeSearchParams } from '@interfaces/EmployeeSearchParams'
import updateEmployeeStatus from '@services/employee/updateEmployeeStatus'
import findEmployeeOptionService from '@services/employee/findEmployeeOption'
import { EmployeeCreateParams } from '@interfaces/EmployeeCreateParams'
import { UpdateEmployeeRequest } from '@interfaces/employee/UpdateEmployeeRequest'
import { createClient } from "redis";

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
 * Helper function to clear all employee related cache for a tenant
 * Uses the scanIterator for cleaner async iteration
 */
async function clearEmployeeCache(tenantId: string) {
  try {
    const pattern = `employee:*:${tenantId}:*`
    const keys: string[] = []

    // Use scanIterator instead of manual cursor handling
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      // @ts-ignore
       keys.push(key)

      // Delete in batches of 100 to avoid large commands
      if (keys.length >= 100) {
        if (keys.length > 0) await redisClient.del(keys) // Pass the array directly
        keys.length = 0
      }
    }

    // Delete any remaining keys
    if (keys.length > 0) await redisClient.del(keys) // Pass the array directly

  } catch (error) {
    console.error('Error clearing employee cache:', error)
  }
}

// export const EmployeeFindAllController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const tenantIdHeader = req.headers['tenant-id'] as string
//     if (!tenantIdHeader) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: 'Tenant ID is required in the request header'
//       })
//     }

//     const {
//       limit: _limit,
//       page: _page,
//       keyword,
//       position,
//       department,
//       contractType,
//       status,
//       sortBy,
//       sortOrder
//     } = req.query

//     // Create cache key based on request parameters
//     const cacheKey = `employee:list:${tenantIdHeader}:${_limit || 'all'}:${_page || 'all'}:${keyword || 'all'}:${position || 'all'}:${department || 'all'}:${contractType || 'all'}:${status || 'all'}:${sortBy || 'all'}:${sortOrder || 'all'}`

//     // Try to get data from cache
//     const cachedData = await redisClient.get(cacheKey)

//     if (cachedData) {
//       // Return cached data if available
//       const parsedData = JSON.parse(cachedData)
//       return res.status(StatusCodes.OK).json(
//         new BaseReponse({
//           status: StatusCodes.OK,
//           message: 'Employees found (cached)',
//           data: new DataTable<Employee>(parsedData.data, parsedData.total, Number(_page), Number(_limit))
//         })
//       )
//     }

//     const params: EmployeeSearchParams = {
//       tenantId: tenantIdHeader,
//       limit: Number(_limit),
//       page: Number(_page),
//       keyword: keyword ? String(keyword).toLowerCase() : undefined,
//       position: position ? String(position).split(',') : undefined,
//       department: department ? String(department).split(',') : undefined,
//       contractType: contractType ? String(contractType).split(',') : undefined,
//       status: status ? String(status).split(',') : undefined,
//       sortBy: sortBy ? (String(sortBy) as 'name' | 'status') : undefined,
//       sortOrder: sortOrder ? (String(sortOrder) as 'ASC' | 'DESC') : undefined
//     }

//     const result = await findAllEmployees(params)

//     // Cache the result for 5 minutes (300 seconds)
//     await redisClient.setEx(cacheKey, 300, JSON.stringify(result))

//     res.status(StatusCodes.OK).json(
//       new BaseReponse({
//         status: StatusCodes.OK,
//         message: 'Employees found',
//         data: new DataTable<Employee>(result.data, result.total, params.page, params.limit)
//       })
//     )
//   } catch (err: any) {
//     next(err)
//   }
// }

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
    const tenantIdHeader = req.headers['tenant-id'] as string

    // Create cache key for employee details
    const cacheKey = `employee:detail:${tenantIdHeader}:${id}`

    // Try to get data from cache
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
      // Return cached data if available
      return res.status(StatusCodes.OK).json(
        new BaseReponse({
          status: StatusCodes.OK,
          message: 'Employee found (cached)',
          data: JSON.parse(cachedData)
        })
      )
    }

    const data = await findEmployeeById(id)

    // Cache the result for 5 minutes (300 seconds)
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

    res.status(StatusCodes.OK).json(new BaseReponse({
      status: StatusCodes.OK,
      message: 'Employee found',
      data
    }))
  } catch (err: any) {
    next(err)
  }
}

export const updateEmployeeStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const tenantIdHeader = req.headers['tenant-id'] as string

    if (!status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: 'Status is required'
      })
    }

    const updatedEmployee = await updateEmployeeStatus(id, status)

    // Clear employee cache for this tenant
    await clearEmployeeCache(tenantIdHeader)

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

    // Clear employee cache for this tenant
    await clearEmployeeCache(tenantIdHeader)

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

    // Clear employee cache for this tenant
    await clearEmployeeCache(tenantIdHeader)

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
    const tenantIdHeader = req.headers['tenant-id'] as string

    await deleteEmployee(id)

    // Clear employee cache for this tenant
    await clearEmployeeCache(tenantIdHeader)

    res.status(StatusCodes.OK).json(
      new BaseReponse({ status: StatusCodes.OK, message: 'Employee deleted successfully' })
    )
  } catch (err: any) {
    next(err)
  }
}
// Ini pake redis
// export const EmployeeFindAllOptionController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const {
//       limit: _limit,
//       page: _page,
//       keyword,
//       employeeId: _employeeId,
//       managerId: _managerId,
//       supervisorId: _supervisorId,
//       mentorId: _mentorId,
//       leadId: _leadId
//     } = req.query

//     const tenantIdHeader = req.headers['tenant-id'] as string

//     // Create cache key based on request parameters
//     const cacheKey = `employee:options:${tenantIdHeader}:${_limit || 'all'}:${keyword || 'all'}:${_employeeId || 'all'}:${_managerId || 'all'}:${_supervisorId || 'all'}:${_mentorId || 'all'}:${_leadId || 'all'}`

//     // Try to get data from cache
//     const cachedData = await redisClient.get(cacheKey)

//     if (cachedData) {
//       // Return cached data if available
//       return res.status(StatusCodes.OK).json(
//         new BaseReponse({
//           status: StatusCodes.OK,
//           message: 'Employee options found (cached)',
//           data: JSON.parse(cachedData).data
//         })
//       )
//     }

//     const params: EmployeeOptionParams = {
//       tenantId: String(tenantIdHeader),
//       limit: Number(_limit),
//       keyword: keyword ? String(keyword).toLowerCase() : undefined,
//       employeeId: _employeeId ? String(_employeeId) : undefined,
//       managerId: _managerId ? String(_managerId) : undefined,
//       supervisorId: _supervisorId ? String(_supervisorId) : undefined,
//       mentorId: _mentorId ? String(_mentorId) : undefined,
//       leadId: _leadId ? String(_leadId) : undefined
//     }

//     const data = await findEmployeeOptionService(params)

//     // Cache the result for 5 minutes (300 seconds)
//     await redisClient.setEx(cacheKey, 300, JSON.stringify(data))

//     res.status(StatusCodes.OK).json(
//       new BaseReponse({
//         status: StatusCodes.OK,
//         message: 'Employee options found',
//         data: data.data
//       })
//     )
//   } catch (err: any) {
//     next(err)
//   }
// }

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
