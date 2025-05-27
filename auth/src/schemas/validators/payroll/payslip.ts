import { object, string, number } from 'yup'

export const PayslipSchema = object().shape({
  headers: object().shape({
    'tenant-id': string().required('Headers tenant-id is a required field')
  }),
  body: object().shape({
    employee_id: string()
      .uuid('Employee ID must be a valid UUID')
      .required('Employee ID is required'),
    period: string()
      .required('Period is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'Period must be in DD-MM-YYYY format'),
    base_salary: number()
      .positive('Base salary must be positive')
      .required('Base salary is required'),
    total_deductions: number()
      .min(0, 'Total deductions cannot be negative')
      .optional(),
    net_salary: number()
      .positive('Net salary must be positive')
      .required('Net salary is required')
  })
})