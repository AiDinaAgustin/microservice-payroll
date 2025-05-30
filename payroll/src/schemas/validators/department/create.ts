import { object, number, string } from 'yup'

export const DepartmentCreateSchema = object().shape({
    body: object().shape({
       name: string().required(),
    })
 })