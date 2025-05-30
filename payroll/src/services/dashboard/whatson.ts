import employeeRepository from '../../repositories/employee/employee';
import errorThrower from '@utils/errorThrower';
import { EmployeeSearchParams, EmployeeWhatsOnTodayParams } from '@interfaces/EmployeeSearchParams';

const whatsOnTodayService = async (params: EmployeeWhatsOnTodayParams) => {
  try {
    return await employeeRepository.findWhatsOnToday(params);
  } catch (err) {
    throw errorThrower(err);
  }
};

export default whatsOnTodayService;
