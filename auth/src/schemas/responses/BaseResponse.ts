import BaseResponseInterface from '@interfaces/BaseResponseInterface'

export class BaseReponse {
   status: number
   message: string
   data: any

   constructor(param: BaseResponseInterface) {
      this.status = param.status
      this.message = param.message
      this.data = param?.data
   }
}
