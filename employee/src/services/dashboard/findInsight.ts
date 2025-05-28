import errorThrower from '@utils/errorThrower'
import employeeRepository from '../../repositories/employee/employee'
import { DashboardFindParams } from '@interfaces/dashboard/dashboardParams'

const findAllInsight = async (params: DashboardFindParams) => {
   try {
      const data = await employeeRepository.findInsight(params)
      return data
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default findAllInsight
