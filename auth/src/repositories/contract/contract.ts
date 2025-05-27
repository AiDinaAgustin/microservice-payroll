import Contract from "@models/Contract";
import errorThrower from "@utils/errorThrower"

const updateContractByEmployeeId = async (employee_id: string, request: object) => {
   try {
      const [affectedRows] = await Contract.update(request, {
         where: {
            deleted: 0,
            employee_id: employee_id
         }
      })

      return affectedRows;
   } catch(err) {
      throw errorThrower(err);
   }
}

export default {updateContractByEmployeeId}
