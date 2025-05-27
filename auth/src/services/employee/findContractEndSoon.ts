import { EmployeeEndContractParams } from "@interfaces/EmployeeSearchParams";
import employeeRepository from "../../repositories/employee/employee";
import errorThrower from "@utils/errorThrower";

const findEmployeeContractEndSoon = async (params: EmployeeEndContractParams) => {
   try {
      const todaysDate = new Date();
      const next30Days = new Date();
      next30Days.setMonth(next30Days.getMonth() + 1);

      return await employeeRepository.findEmployeeByEndContractSoon({ todaysDate, next30Days }, params);
   } catch (err) {
      throw errorThrower(err)
   }
};

export default findEmployeeContractEndSoon;
