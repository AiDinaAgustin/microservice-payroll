import { object, string, number } from 'yup'

export const AttendanceSchema = object().shape({
  headers: object().shape({
    'tenant-id': string().required('Headers tenant-id is a required field')
  }),
  body: object().shape({
    employee_id: string()
      .required('Employee ID is required'),
    date: string()
      .required('Date is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'Date must be in DD-MM-YYYY format'),
    status: string()
      .required('Status is required')
      .oneOf(['present', 'absent', 'late', 'leave'], 'Invalid status value'),
    check_in: string()
      .matches(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/, 'Check-in must be in DD-MM-YYYY HH:mm:ss format')
      .nullable()
      .optional(),
    check_out: string()
      .matches(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/, 'Check-out must be in DD-MM-YYYY HH:mm:ss format')
      .nullable()
      .optional(),
    late_minutes: number()
      .min(0, 'Late minutes cannot be negative')
      .nullable()
      .optional()
  })
})