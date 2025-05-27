import { object, number, string, boolean } from 'yup'

export const ContractTypeCreateSchema = object().shape({
    body: object().shape({
       name: string().required("contract type name is required"),
       is_permanent: boolean().required("is permanent is required")
    })
 })
