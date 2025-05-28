// import { NextFunction, Request, Response } from 'express'

// import ErrorResponseInterface from '@interfaces/ErrorResponseInterface'
// import BaseError from '@responses/BaseError'
// import { StatusCodes } from 'http-status-codes'

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export default function errorHandler(
//    err: BaseError,
//    req: Request,
//    res: Response<ErrorResponseInterface>,
//    next: NextFunction
// ) {
//    console.log(err)
//    const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR
//    res.status(statusCode)
//    res.json({
//       status: statusCode,
//       message: err.message || 'An internal server error occurred'
//    })
// }

// GREEN
// import { NextFunction, Request, Response } from 'express';
// import ErrorResponseInterface from '@interfaces/ErrorResponseInterface';
// import BaseError from '@responses/BaseError';
// import { StatusCodes } from 'http-status-codes';

// export default function errorHandler(
//   err: BaseError,
//   req: Request,
//   res: Response<ErrorResponseInterface>,
//   next: NextFunction
// ) {
//   const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
//   res.status(statusCode).json({
//     status: statusCode,
//     message: err.message || 'An internal server error occurred'
//   });
// }

// refactor
import { NextFunction, Request, Response } from 'express';
import ErrorResponseInterface from '@interfaces/ErrorResponseInterface';
import BaseError from '@responses/BaseError';
import { StatusCodes } from 'http-status-codes';

export default function errorHandler(
  err: BaseError,
  req: Request,
  res: Response<ErrorResponseInterface>,
  next: NextFunction
) {
  const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const response: ErrorResponseInterface = {
    status: statusCode,
    message: err.message || 'An internal server error occurred'
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}
