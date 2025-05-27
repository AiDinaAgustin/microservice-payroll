import contractTypeRepository from "../../repositories/contract-type/contractTypeRepository";
import errorThrower from "@utils/errorThrower";

export const deleteContractTypeService = async (id:string, tenantId:string) => {
    try {
        return await contractTypeRepository.deleteContractType(id, tenantId)
    } catch (err: any) {
        throw errorThrower(err)
    }
}

export default deleteContractTypeService
