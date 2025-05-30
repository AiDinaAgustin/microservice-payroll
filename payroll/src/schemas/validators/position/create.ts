import { object, number, string } from 'yup'

export const PositionCreateSchema = object().shape({
    body: object().shape({
       name: string().required(),
    })
 })