import { object, number, string } from 'yup'

export const DepartmentFindSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
    query: object().shape({
       page: number().required(),
       limit: number().required(),
       keyword: string(),
         sortBy: string().required(),
         sortOrder: string().required(),
         status: string()
    })
 })