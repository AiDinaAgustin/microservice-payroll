import { object, number, string, boolean } from 'yup'

export const ContractTypeFindSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }), 
   query: object().shape({
       page: number().required(),
       limit: number().required(),
       keyword: string(),
       sortBy: string().required(),
       sortOrder: string().required(),
       status: string(),
       isPermanent: boolean()
    })
 })