// import BaseError from '@responses/BaseError'
// import { NextFunction, Request, Response } from 'express'
// import { StatusCodes } from 'http-status-codes'

// export default function notFound(req: Request, res: Response, next: NextFunction) {
//    res.status(StatusCodes.NOT_FOUND)
//    const error = new BaseError({ status: StatusCodes.NOT_FOUND, message: `URL Not Found - ${req.originalUrl}` })
//    next(error)
// }

// GREEN
// import BaseError from '@responses/BaseError'
// import { NextFunction, Request, Response } from 'express'
// import { StatusCodes } from 'http-status-codes'

// export default function notFound(req: Request, res: Response, next: NextFunction) {
//    res.status(StatusCodes.NOT_FOUND);
//    const error = new BaseError({ 
//      status: StatusCodes.NOT_FOUND, 
//      message: `URL Not Found - ${req.originalUrl}` 
//    });
//    next(error);
// }

// REFACTOR
import BaseError from '@responses/BaseError'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export default function notFound(req: Request, res: Response, next: NextFunction) {
  // Set status first, then pass formatted error to error handler
  res.status(StatusCodes.NOT_FOUND);
  next(
    new BaseError({ 
      status: StatusCodes.NOT_FOUND, 
      message: `URL Not Found - ${req.originalUrl}` 
    })
  );
}