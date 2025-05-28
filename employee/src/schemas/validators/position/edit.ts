import { object, number, string } from 'yup'

export const PositionUpdateSchema = object().shape({
    body: object().shape({
       name: string().required(),
       status: string().oneOf(['active', 'inactive']).optional(),
       departmentId: string().required()
    })
 })