// import { Request, NextFunction, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import BaseError from '@responses/BaseError';
// import fetchToken from '@utils/jwt';
// import { BaseReponse } from '@responses/BaseResponse';
// import  UserRepository  from '../repositories/user/user';

// // Refactor
// const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
//    const { authorization } = req?.headers;

//    try {
//       if (typeof authorization !== 'string' || String(authorization).length < 1) {
//          throw new BaseError({
//             status: StatusCodes.UNAUTHORIZED,
//             message: 'Invalid bearer token',
//          });
//       }

//       let token = authorization.split(' ')[1];

//       const user = await fetchToken(token);

//       if (!user) {
//          throw new BaseError({
//             status: StatusCodes.UNAUTHORIZED,
//             message: 'Invalid Bearer Token',
//          });
//       }

//       const { exp } = user.payload;
//       const currentDate = new Date().getTime() / 1000;

//       if(exp) {
//          if(currentDate > exp) {
//             throw new BaseError({
//                status: 401,
//                message: "Token has expired"
//             });
//          }
//       }
//       const findUser = await UserRepository.findByUsername(String(user.payload.uid)) ;

//       if(!findUser) throw new BaseError({
//          status : StatusCodes.UNAUTHORIZED,
//          message: 'User not found',
//       });

//       next();
//    } catch (error: any) {
//       const status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;
//       res.status(status).json(
//          new BaseReponse({
//             status: status,
//             message: error.message,
//          }),
//       );
//    }
// };

// // Red
// // const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
// //    next();
// // };

// // Green
// // const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
// //    try {
// //       const { authorization } = req?.headers;

// //       if (!authorization?.startsWith('Bearer ')) {
// //          return res.status(StatusCodes.UNAUTHORIZED).json({
// //             status: StatusCodes.UNAUTHORIZED,
// //             message: 'Invalid bearer token'
// //          });
// //       }

// //       const token = authorization.split(' ')[1];
// //       const user = await fetchToken(token);

// //       if (!user) {
// //          return res.status(StatusCodes.UNAUTHORIZED).json({
// //             status: StatusCodes.UNAUTHORIZED,
// //             message: 'Invalid Bearer Token'
// //          });
// //       }

// //       next();
// //    } catch (error) {
// //       next(error);
// //    }
// // };
// export default AuthorizationCheck;

import { Request, NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import BaseError from '@responses/BaseError';
import fetchToken from '@utils/jwt';
import { BaseReponse } from '@responses/BaseResponse';
import UserRepository from '../repositories/user/user';

const AuthorizationCheck = async (req: Request, res: Response, next: NextFunction) => {
   let { authorization } = req?.headers;
   
   console.log('=== AUTHORIZATION CHECK DEBUG ===');
   console.log('Headers received:', JSON.stringify(req.headers));
   console.log('Authorization header:', authorization);

      // Try to get token from cookies if Authorization header is missing
      if (!authorization && req.cookies && req.cookies.token) {
         console.log('Authorization header missing, trying to get token from cookies');
         authorization = `Bearer ${req.cookies.token}`;
         console.log('Created Authorization from cookie:', authorization);
      }
   
   try {
      if (typeof authorization !== 'string' || String(authorization).length < 1) {
         console.log('ERROR: Authorization header is missing or invalid');
         throw new BaseError({
            status: StatusCodes.UNAUTHORIZED,
            message: 'Invalid bearer token',
         });
      }

      let token = authorization.split(' ')[1];
      console.log('Token extracted:', token ? `${token.substring(0, 15)}...` : 'NONE'); // Show first 15 chars for security

      try {
         const user = await fetchToken(token);
         console.log('Token verification result:', user ? 'SUCCESS' : 'FAILED');
         
         if (!user) {
            console.log('ERROR: Token verification failed');
            throw new BaseError({
               status: StatusCodes.UNAUTHORIZED,
               message: 'Invalid Bearer Token',
            });
         }

         console.log('User payload:', JSON.stringify(user.payload));
         
         const { exp } = user.payload;
         const currentDate = new Date().getTime() / 1000;
         console.log(`Token expiration: ${exp}, Current time: ${currentDate}`);

         if(exp) {
            if(currentDate > exp) {
               console.log('ERROR: Token expired');
               throw new BaseError({
                  status: 401,
                  message: "Token has expired"
               });
            }
         }
         
         const findUser = await UserRepository.findByUsername(String(user.payload.uid));
         console.log('User found in DB:', findUser ? 'YES' : 'NO');

         if(!findUser) {
            console.log('ERROR: User not found in database');
            throw new BaseError({
               status: StatusCodes.UNAUTHORIZED,
               message: 'User not found',
            });
         }

         console.log('=== AUTH CHECK PASSED ===');
         next();
      } catch (tokenError) {
         console.log('ERROR in token processing:', tokenError);
         throw new BaseError({
            status: StatusCodes.UNAUTHORIZED,
            message: 'Token verification failed',
         });
      }
   } catch (error: any) {
      console.log('FINAL ERROR:', error.message);
      const status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json(
         new BaseReponse({
            status: status,
            message: error.message,
         }),
      );
   }
};

export default AuthorizationCheck;

