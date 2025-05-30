import { StatusCodes } from 'http-status-codes'
import Employee from '@models/Employee'
import BaseError from '@responses/BaseError'
import errorThrower from '@utils/errorThrower'
import { UpdateEmployeeRequest } from '@interfaces/employee/UpdateEmployeeRequest'
import EmployeeRepository from '../../repositories/employee/employee';
import ContractRepository from '../../repositories/contract/contract';
import Contract from '@models/Contract'
import { ConvertFormatDate, ConvertFormatDateNulllable } from '../convert-date/converterDate';

const updateEmployee = async (id: string,tenant_id: string, request: UpdateEmployeeRequest) => {
   const { birth_date, start_date, end_date, contract_type_id, ...employeeData } = request;
   try {
      await EmployeeRepository.updateEmployee(id, tenant_id, {...employeeData, birth_date: ConvertFormatDate(birth_date)});
      await ContractRepository.updateContractByEmployeeId(id, {
         contract_type_id: contract_type_id,
         start_date: ConvertFormatDate(start_date),
         end_date: ConvertFormatDateNulllable(end_date),
      });

      const [employee, contracts] = await Promise.all([
         Employee.findOne({ where: { id: id, deleted: 0 } }),
         Contract.findOne({ where: { employee_id: id } })
      ])

      if (!employee) {
         throw new BaseError({
            status: StatusCodes.NOT_FOUND,
            message: `Contract for Employee not found after update`
         })
      }

      if (!contracts) {
         throw new BaseError({
            status: StatusCodes.NOT_FOUND,
            message: `Contract for Employee not found after update`
         })
      }

      return {
         employee_id: employee.employee_id,
         name: employee.name,
         status: employee.status,
         nik: employee.nik,
         email: employee.email,
         phone_number: employee.phone_number,
         address: employee.address,
         birth_date: employee.birth_date,
         gender: employee.gender,
         npwp: employee.npwp,
         emergency_contact: employee.emergency_contact,
         position_id: employee.position_id,
         department_id: employee.department_id,
         manager_id: employee.manager_id,
         supervisor_id: employee.supervisor_id,
         team_lead_id: employee.team_lead_id,
         mentor_id: employee.mentor_id,
         tenant_id: employee.tenant_id,
         image_url: employee.image_url,
         medical_condition: employee.medical_condition,
         marital_status_id: employee.marital_status_id,
         contract_id: contracts.id,
         contract_type_id: contracts.contract_type_id,
         start_date: contracts.start_date,
         end_date: contracts.end_date
      }
   } catch (err: any) {
      throw errorThrower(err)
   }
}

export default updateEmployee
