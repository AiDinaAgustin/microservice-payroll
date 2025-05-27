import { object, string, number, boolean, bool, date } from 'yup'
import { baseFindIdSchema, baseFindSchema } from './baseFind'
import { query } from 'express'

export const EmployeeCreateSchema = object().shape({
   headers: object().shape({ 'tenant-id': string().required('Headers tenant-id is a required field') }),
   body: object().shape({
      nik: string()
         .required()
         .matches(/^\d{16}$/, 'NIK must be exactly 16 digits'),
      name: string().required(),
      employee_id: string().required(),
      email: string().required(),
      npwp: string(),
      phone_number: string().required(),
      address: string().required(),
      birth_date: string()
         .required()
         .matches(/^\d{2}-\d{2}-\d{4}$/, 'birthDate must be in DD-MM-YYYY format'),
      gender: string().required(),
      marital_status_id: string().required(),
      medical_condition: string().optional().nullable(),
      emergency_contact: string().required(),
      position_id: string().required(),
      department_id: string(),
      manager_id: string().nullable().optional(),
      supervisor_id: string().nullable().optional(),
      team_lead_id: string().nullable().optional(),
      mentor_id: string().nullable().optional(),
      contract_type_id: string().required(),
      start_date: string()
         .required()
         .matches(/^\d{2}-\d{2}-\d{4}$/, 'startDate must be in DD-MM-YYYY format'),
      end_date: string().matches(/^\d{2}-\d{2}-\d{4}$/, 'endDate must be in DD-MM-YYYY format'),
      image_url: string().nullable().optional()
   })
})

export const EmployeeUpdateSchema = baseFindIdSchema.concat(
   object().shape({
      body: object().shape({
      nik: string()
         .required()
         .matches(/^\d{16}$/, 'NIK must be exactly 16 digits'),
      name: string().required(),
      employee_id: string().required(),
      email: string().required(),
      npwp: string(),
      phone_number: string().required(),
      address: string().required(),
      birth_date: string()
         .required()
         .matches(/^\d{2}-\d{2}-\d{4}$/, 'birthDate must be in DD-MM-YYYY format'),
      gender: string().required(),
      marital_status_id: string().required(),
      medical_condition: string().nullable().optional(),
      emergency_contact: string().required(),
      position_id: string().required("position is required"),
      department_id: string(),
      manager_id: string().nullable().optional(),
      supervisor_id: string().nullable().optional(),
      team_lead_id: string().nullable().optional(),
      mentor_id: string().nullable().optional(),
      contract_type_id: string().required("contract type is required"),
      start_date: string()
         .required("start date is required")
         .matches(/^\d{2}-\d{2}-\d{4}$/, 'startDate must be in DD-MM-YYYY format'),
      end_date: string().matches(/^\d{2}-\d{2}-\d{4}$/, 'endDate must be in DD-MM-YYYY format'),
      image_url: string().nullable().optional()
      })
   })
)

export const EmployeeFindSchema = object().shape({
   query: object().shape({
      page: number().required(),
      limit: number().required(),
      keyword: string(),
      position: string(),
      department: string(),
      contractType: string(),
      status: string(),
      sortBy: string().oneOf(['name', 'status']),
      sortOrder: string().oneOf(['ASC', 'DESC'])
   })
})

export const EmployeeFindEndContractSchema = object().shape({
   query: object().shape({
      page: number().required(),
      limit: number().required()
   })
})

export const EmployeeFindByIdSchema = baseFindIdSchema
export const EmployeeDeleteSchema = baseFindIdSchema
