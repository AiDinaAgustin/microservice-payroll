import departementRepository from "../../repositories/departement/departementRepository";
import errorThrower from "@utils/errorThrower";

const patchDepartmentStatusService = async (id: string, tenantId: string, status: 'active' | 'inactive') => {
   try {
      return await departementRepository.patchDepartmentStatus(id, tenantId, status)
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default patchDepartmentStatusService