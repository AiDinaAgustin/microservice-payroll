import { object, string, number } from 'yup'

export const SalarySchema = object().shape({
  headers: object().shape({
    'tenant-id': string().required('Headers tenant-id is a required field')
  }),
  body: object().shape({
    employee_id: string()
      .uuid('Employee ID must be a valid UUID')
      .required('Employee ID is required'),
    base_salary: number()
      .positive('Base salary must be positive')
      .required('Base salary is required'),
    allowances: number()
      .min(0, 'Allowances cannot be negative')
      .optional(),
    period: string()
      .required('Period is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'Period must be in DD-MM-YYYY format'),
    effective_date: string()
      .required('Effective date is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'Effective date must be in DD-MM-YYYY format')
  })
})