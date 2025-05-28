import BaseResponseInterface from './BaseResponseInterface'

export default interface ErrorResponse extends BaseResponseInterface {
   error?: string,
   status: number;
   message: string;
   errors?: string[];
}
