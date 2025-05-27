import contractTypeRepository from "../../repositories/contract-type/contractTypeRepository";
import errorThrower from "@utils/errorThrower";
import { ContractTypeFindParams } from "@interfaces/contract-type/contractTypeFindParams";

const findAllContractTypeService = async (params: ContractTypeFindParams) => {
    try {
        return await contractTypeRepository.findAllContractType(params)
    } catch (err: any) {
        throw errorThrower(err)        
    }
}

export default findAllContractTypeService