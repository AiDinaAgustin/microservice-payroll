import { Request, NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import BaseError from '@responses/BaseError';
import fetchToken from '@utils/jwt';
import { BaseReponse } from '@responses/BaseResponse';
import  UserRepository  from '../repositories/user/user';

// Refactor
const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
   const { authorization } = req?.headers;

   try {
      if (typeof authorization !== 'string' || String(authorization).length < 1) {
         throw new BaseError({
            status: StatusCodes.UNAUTHORIZED,
            message: 'Invalid bearer token',
         });
      }

      let token = authorization.split(' ')[1];

      const user = await fetchToken(token);

      if (!user) {
         throw new BaseError({
            status: StatusCodes.UNAUTHORIZED,
            message: 'Invalid Bearer Token',
         });
      }

      const { exp } = user.payload;
      const currentDate = new Date().getTime() / 1000;

      if(exp) {
         if(currentDate > exp) {
            throw new BaseError({
               status: 401,
               message: "Token has expired"
            });
         }
      }
      const findUser = await UserRepository.findByUsername(String(user.payload.uid)) ;

      if(!findUser) throw new BaseError({
         status : StatusCodes.UNAUTHORIZED,
         message: 'User not found',
      });

      next();
   } catch (error: any) {
      const status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json(
         new BaseReponse({
            status: status,
            message: error.message,
         }),
      );
   }
};

// Red
// const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
//    next();
// };

// Green
// const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
//    try {
//       const { authorization } = req?.headers;

//       if (!authorization?.startsWith('Bearer ')) {
//          return res.status(StatusCodes.UNAUTHORIZED).json({
//             status: StatusCodes.UNAUTHORIZED,
//             message: 'Invalid bearer token'
//          });
//       }

//       const token = authorization.split(' ')[1];
//       const user = await fetchToken(token);

//       if (!user) {
//          return res.status(StatusCodes.UNAUTHORIZED).json({
//             status: StatusCodes.UNAUTHORIZED,
//             message: 'Invalid Bearer Token'
//          });
//       }

//       next();
//    } catch (error) {
//       next(error);
//    }
// };
export default AuthorizationCheck;
