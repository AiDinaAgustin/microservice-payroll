import { object, string } from 'yup'

export const CalculateDeductionSchema = object().shape({
  headers: object().shape({
    'tenant-id': string().required('Headers tenant-id is a required field')
  }),
  body: object().shape({
    employee_id: string()
      .required('Employee ID is required'),
    period: string()
      .required('Period is required')
      .matches(/^\d{2}-\d{4}$/, 'Period must be in MM-YYYY format')
  })
})