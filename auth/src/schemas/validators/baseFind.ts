import { object, number, string } from 'yup'

export const baseFindSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   query: object().shape({
      page: number().required(),
      limit: number().required()
   })
})

export const baseFindIdSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   params: object().shape({
      id: string().required()
   })
})

export const baseFindOptionSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   query: object().shape({
      limit: number().required()
   })
})
