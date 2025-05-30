// import { Request, Response, NextFunction } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import fetchToken from '@utils/jwt';
// import BaseError from '@responses/BaseError';
// import PermissionRepository from '../repositories/permission/permissionRepository';
// import UserRepository from '../repositories/user/user';
// import { parse } from 'url';

// const PermissionCheck = async (req: Request, res: Response, next: NextFunction) => {
//   const { authorization } = req.headers;

//   try {
//     if (typeof authorization !== 'string' || String(authorization).length < 1) {
//       throw new BaseError({
//         status: StatusCodes.UNAUTHORIZED,
//         message: 'Invalid bearer token',
//       });
//     }

//     const token = authorization.split(' ')[1];
//     const user = await fetchToken(token);

//     if (!user) {
//       throw new BaseError({
//         status: StatusCodes.UNAUTHORIZED,
//         message: 'Invalid Bearer Token',
//       });
//     }

//     const findUser = await UserRepository.findByUsername(String(user.payload.uid));

//     if (!findUser) {
//       throw new BaseError({
//         status: StatusCodes.UNAUTHORIZED,
//         message: 'User not found',
//       });
//     }

//     const parsedUrl = parse(req.originalUrl);
//     let endpoint = parsedUrl.pathname ? parsedUrl.pathname.replace('/v1', '') : '';

//     endpoint = endpoint.replace(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|\d+)/g, '/:id');

//     const permission = await PermissionRepository.findByRoleIdAndEndpoint(findUser.role_id, endpoint);

//     if (!permission) {
//       throw new BaseError({
//         status: StatusCodes.FORBIDDEN,
//         message: 'You do not have permission to access this endpoint',
//       });
//     }

//     next();
//   } catch (error: any) {
//     const status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;
//     res.status(status).json({
//       status: status,
//       message: error.message,
//     });
//   }
// };

// export default PermissionCheck;

// GREEN
// import { Request, Response, NextFunction } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import fetchToken from '@utils/jwt';
// import UserRepository from '../repositories/user/user';
// import PermissionRepository from '../repositories/permission/permissionRepository';
// import { parse } from 'url';

// const PermissionCheck = async (req: Request, res: Response, next: NextFunction) => {
//   const { authorization } = req.headers;

//   // Check for valid authorization header
//   if (typeof authorization !== 'string' || authorization.length < 1) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       status: StatusCodes.UNAUTHORIZED,
//       message: 'Invalid bearer token',
//     });
//   }

//   // Extract token
//   const token = authorization.split(' ')[1];
//   const user = await fetchToken(token);

//   // Check token is valid
//   if (!user) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       status: StatusCodes.UNAUTHORIZED,
//       message: 'Invalid Bearer Token',
//     });
//   }

//   // Find user by username
//   const findUser = await UserRepository.findByUsername(String(user.payload.uid));
//   if (!findUser) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       status: StatusCodes.UNAUTHORIZED,
//       message: 'User not found',
//     });
//   }

//   // Process URL
//   const parsedUrl = parse(req.originalUrl);
//   let endpoint = parsedUrl.pathname ? parsedUrl.pathname.replace('/v1', '') : '';
  
//   // Check permissions
//   const permission = await PermissionRepository.findByRoleIdAndEndpoint(findUser.role_id, endpoint);
//   if (!permission) {
//     return res.status(StatusCodes.FORBIDDEN).json({
//       status: StatusCodes.FORBIDDEN,
//       message: 'You do not have permission to access this endpoint',
//     });
//   }

//   next();
// };

// export default PermissionCheck;

// REFACTOR
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import fetchToken from '@utils/jwt';
import BaseError from '@responses/BaseError';
import PermissionRepository from '../repositories/permission/permissionRepository';
import UserRepository from '../repositories/user/user';
import { parse } from 'url';

const PermissionCheck = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  try {
    if (typeof authorization !== 'string' || String(authorization).length < 1) {
      throw new BaseError({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid bearer token',
      });
    }

    const token = authorization.split(' ')[1];
    const user = await fetchToken(token);

    if (!user) {
      throw new BaseError({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid Bearer Token',
      });
    }

    const findUser = await UserRepository.findByUsername(String(user.payload.uid));

    if (!findUser) {
      throw new BaseError({
        status: StatusCodes.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    const parsedUrl = parse(req.originalUrl);
    let endpoint = parsedUrl.pathname ? parsedUrl.pathname.replace('/v1', '') : '';

    // Replace UUID and numeric IDs with :id
    endpoint = endpoint.replace(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|\d+)/g, '/:id');

    const permission = await PermissionRepository.findByRoleIdAndEndpoint(findUser.role_id, endpoint);

    if (!permission) {
      throw new BaseError({
        status: StatusCodes.FORBIDDEN,
        message: 'You do not have permission to access this endpoint',
      });
    }

    next();
  } catch (error: any) {
    const status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({
      status: status,
      message: error.message,
    });
  }
};

export default PermissionCheck;