import { StatusCodes } from 'http-status-codes'
import Employee from '@models/Employee'
import BaseError from '@responses/BaseError'
import errorThrower from '@utils/errorThrower'

const deleteEmployee = async (id: number) => {
   try {
      const affectedRows = await Employee.destroy({ where: { id } })
      if (affectedRows === 0) {
         throw new BaseError({
            status: StatusCodes.NOT_FOUND,
            message: `ID ${id} not found`
         })
      }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default deleteEmployee
