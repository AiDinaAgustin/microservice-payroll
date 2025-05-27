import contractTypeRepository from "../../repositories/contract-type/contractTypeRepository";
import errorThrower from "@utils/errorThrower";
import { ContractTypeCreateParams } from "@interfaces/contract-type/ContractTypeCreateParams";

export const createContractType = async (params: ContractTypeCreateParams) => {
    try {
        return await contractTypeRepository.createContractType(params)
    } catch (err: any) {
        throw errorThrower(err)
    }
}

export default createContractType
