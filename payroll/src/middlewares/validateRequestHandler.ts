// Baru
// import BaseError from '@responses/BaseError'
// import { Request, Response, NextFunction } from 'express'
// import { StatusCodes } from 'http-status-codes'
// import { Schema, ValidateOptions } from 'yup'

// export default function validateRequestHandler(schema: Schema, options?: ValidateOptions) {
//    return async (req: Request, res: Response, next: NextFunction) => {
//       try {
//          await schema.validate(req, {
//             ...options,
//             abortEarly: false,
//             stripUnknown: false
//          })
//          next()
//       } catch (err: any) {
//          const error = new BaseError({
//             status: StatusCodes.BAD_REQUEST,
//             message: err.errors ? err.errors.join(', ') : err.message
//          })
//          next(error)
//       }
//    }
// }

// GREEN
import BaseError from '@responses/BaseError'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Schema, ValidateOptions } from 'yup'

export default function validateRequestHandler(schema: Schema, options?: ValidateOptions) {
   return async (req: Request, res: Response, next: NextFunction) => {
      try {
         await schema.validate(req, {
            ...options,
            abortEarly: false,
            stripUnknown: false
         })
         next()
      } catch (err: any) {
         const error = new BaseError({
            status: StatusCodes.BAD_REQUEST,
            message: err.errors ? err.errors.join(', ') : err.message
         })
         next(error)
      }
   }
}

// REFACTOR
// import BaseError from '@responses/BaseError'
// import { Request, Response, NextFunction } from 'express'
// import { StatusCodes } from 'http-status-codes'
// import { Schema, ValidateOptions } from 'yup'

// export default function validateRequestHandler(schema: Schema, options?: ValidateOptions) {
//    return async (req: Request, res: Response, next: NextFunction) => {
//       try {
//          // Apply schema validation with merged options
//          const validationOptions: ValidateOptions = {
//             abortEarly: false, // Collect all errors
//             stripUnknown: false, // Don't remove unknown properties
//             ...options // Override with custom options
//          };

//          await schema.validate(req, validationOptions);
         
//          // Validation passed, continue
//          next();
//       } catch (err: any) {
//          // Format validation errors
//          const errorMessage = err.errors && Array.isArray(err.errors)
//             ? err.errors.join(', ')
//             : err.message || 'Invalid request data';

//          // Create structured error and pass to error handler
//          const error = new BaseError({
//             status: StatusCodes.BAD_REQUEST,
//             message: errorMessage,
//             errors: err.errors
//          });
         
//          next(error);
//       }
//    }
// }
