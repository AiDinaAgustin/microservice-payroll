import BaseError from '@responses/BaseError'
import { StatusCodes } from 'http-status-codes'

/**
 * Throws the given error if it is an instance of BaseError,
 * otherwise throws a new BaseError with a 500 status code and
 * a generic error message.
 *
 * @param {any} err - The error to throw.
 */
const errorThrower = (err: any): never => {
   if (err instanceof BaseError) {
      throw err
   }
   throw new BaseError({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message || 'An internal server error occurred'
   })
}

export default errorThrower
