import { object, number, string } from 'yup'

export const PositionFindSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
    query: object().shape({
       page: number().required(),
       limit: number().required(),
       departmentId: string(),
       keyword: string(),
       sortBy: string().required(),
       sortOrder: string().required(),
       status: string()
    })
 })