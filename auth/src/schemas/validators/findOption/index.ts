import { object, string, number } from 'yup'
import { baseFindOptionSchema, baseFindSchema } from '@validators/baseFind'

export const MaritalStatusOptionFindSchema = baseFindOptionSchema.concat(
   object().shape({
      query: object().shape({
         limit: number().required(),
         keyword: string()
      })
   })
)

export const DepartmentOptionFindSchema = baseFindOptionSchema.concat(
   object().shape({
      query: object().shape({
         limit: number().required(),
         keyword: string()
      })
   })
)

export const PositionOptionFindSchema = baseFindOptionSchema.concat(
   object().shape({
      query: object().shape({
         limit: number().required(),
         departmentId: string(),
         keyword: string()
      })
   })
)

export const ContractTypeOptionFindSchema = baseFindOptionSchema.concat(
   object().shape({
      query: object().shape({
         limit: number().required(),
         keyword: string()
      })
   })
)
