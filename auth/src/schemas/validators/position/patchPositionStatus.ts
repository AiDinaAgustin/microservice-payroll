import { object, string } from 'yup'

export const PositionPatchStatusSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   body: object().shape({
      status: string().required('Status is a required field').oneOf(['active', 'inactive'], 'Invalid status value')
   })
})