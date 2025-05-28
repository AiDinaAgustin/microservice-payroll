import { number, object, string } from 'yup'

export const DashboardInsightSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   query: object().shape({
      byDate: string()
         .nullable()
         .optional()
         .matches(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-([12]\d{3})$/, 'byDate must be in DD-MM-YYYY format'),
      startDate: string()
         .nullable()
         .optional()
         .matches(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-([12]\d{3})$/, 'startDate must be in DD-MM-YYYY format'),
      endDate: string()
         .nullable()
         .optional()
         .matches(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-([12]\d{3})$/, 'endDate must be in DD-MM-YYYY format'),
      byMonth: string()
         .nullable()
         .optional()
         .matches(/^(0[1-9]|1[0-2])-([12]\d{3})$/, 'byMonth must be in MM-YYYY format (MM: 01-12)'),
      byQuarter: string()
         .nullable()
         .optional()
         .matches(/^Q[1-4]-([12]\d{3})$/, 'byQuarter must be in UPPERCASE_QUARTER-YYYY format (e.g., Q1-2024, Q4-2024)')
   })
})

export const DashboardContractEndSoonSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
});

export const DashboardWhatsOnTodaySchema = object().shape({
   headers: object().shape({
      'tenant-id': string().required('Headers tenant-id is a required field')
   })
})
