import { login, LoginRequest, LoginResponse } from '@services/authentication/login'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const LoginController = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { username, password } = req.body
      const request: LoginRequest = {
         username: username,
         password: password
      }

      const response: LoginResponse = await login(request)

      res.status(StatusCodes.OK).json({
         status: StatusCodes.OK,
         message: 'Login Success',
         token: response.token,
         expired_token: response.expire_token,
         data: {
            id: response.id,
            tenant_id: response.tenant_id,
            username: response.username,
            last_login: response.last_login,
            employee_id: response.employee_id,
            role_id: response.role_id,
            role_name: response.role_name
         },
         permissions: response.permissions
      })
   } catch (err: any) {
      next(err)
   }
}
