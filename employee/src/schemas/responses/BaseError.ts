// import BaseErrorInterface from '@interfaces/BaseErrorInterface'
// import { StatusCodes } from 'http-status-codes'

// class BaseError extends Error {
//    status
//    constructor(param: BaseErrorInterface) {
//       super(param?.message)
//       this.status = param?.status || StatusCodes.INTERNAL_SERVER_ERROR
//    }
// }

// export default BaseError

interface ErrorParams {
  status: number;
  message: string;
  errors?: string[];
}

export default class BaseError extends Error {
  status: number;
  errors?: string[];

  constructor({ status, message, errors }: ErrorParams) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
