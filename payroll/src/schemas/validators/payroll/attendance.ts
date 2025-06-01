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
    check_in: string()
      .required('Check-in time is required')
      .matches(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/, 'Check-in must be in DD-MM-YYYY HH:mm:ss format'),
    // Status and late_minutes are now optional as they're calculated automatically
    status: string()
      .oneOf(['present', 'absent', 'late', 'leave'], 'Invalid status value')
      .optional(),
    late_minutes: number()
      .min(0, 'Late minutes cannot be negative')
      .optional(),
    // Check-out is also optional as it's calculated automatically
    check_out: string()
      .matches(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/, 'Check-out must be in DD-MM-YYYY HH:mm:ss format')
      .optional()
  })
})