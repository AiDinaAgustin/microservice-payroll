import User from '@models/User'
import Role from '@models/Role'
import { StatusCodes } from 'http-status-codes'
import BaseError from '@responses/BaseError'
import dotenv from 'dotenv'
import * as fs from 'fs'
import { SignJWT } from 'jose'
import crypto from 'crypto'
import permissions from '@utils/permissions'
import { permissionDummyData } from '@constants/permissionDummy'

dotenv.config()

export type LoginRequest = {
   username: string
   password: string
}

export type LoginResponse = {
   token: string
   id: string
   tenant_id: string
   role_id: string
   username: string
   last_login: Date | null
   employee_id: string
   role_name: string
   expire_token: number
   permissions: any
}

const logger = require('../../config/logger')

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
   try {
      const { username, password } = request
      logger.info('Login Start', {
         context: `Login Service`,
         request: {
            username: username
         }
      })
      let user = await User.findOne({
         include: {
            model: Role,
            as: 'role',
            attributes: ['name']
         },
         where: { username: username, deleted: 0 },
         attributes: ['id', 'tenant_id', 'username', 'password', 'role_id', 'last_login', 'employee_id']
      })
      if (!user) {
         logger.error(`Login Failed : invalid username`, { context: `Login Service`, request: { username: username } })
         throw new BaseError({
            status: StatusCodes.BAD_REQUEST,
            message: 'invalid username or password'
         })
      }
      if (!(await user.comparePassword(password, user.password))) {
         logger.error(`Login Failed : invalid password`, { context: `Login Service`, request: { username: username } })
         throw new BaseError({
            status: StatusCodes.UNAUTHORIZED,
            message: 'invalid username or password'
         })
      }

      let currentTime = Date.now() / 1000
      let payload = {
         iat: currentTime,
         exp: currentTime + eval(`${process.env?.JWT_EXPIRATION_TIME} * 60 * 60` || "8 * 60 * 60"),
         uid: user.username,
         role: user.role?.name ?? ''
      }

      const privateKey = fs.readFileSync('./' + process.env.JWT_TOKEN, 'utf-8')
      const createPrivateKey = crypto.createPrivateKey(privateKey)

      const token = new SignJWT(payload).setProtectedHeader({ alg: 'RS256' }).sign(createPrivateKey)

      logger.info(`Token Generated`, { context: 'Login Service', request: { token: token } })

      const rolePermissions = await permissions(user.role_id)

      logger.info(`role permission generated : `, { context: `Login Service`, permissions: rolePermissions })

      const response: LoginResponse = {
         token: await token,
         id: user.id,
         tenant_id: user.tenant_id,
         role_id: user.role_id,
         role_name: user.role?.name ?? '',
         username: user.username,
         last_login: user.last_login,
         employee_id: user.employee_id,
         expire_token: payload.exp,
         permissions: rolePermissions
      }

      logger.info('Login Success', { context: 'Login Service' })

      return response
   } catch (error: any) {
      logger.error(`Login Failed : ${error.message}`, { context: `Login Service` })
      if (error instanceof BaseError) {
         throw error
      }

      throw new BaseError({
         status: StatusCodes.INTERNAL_SERVER_ERROR,
         message: error.message
      })
   }
}
