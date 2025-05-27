import { EmployeeCreateParams } from '@interfaces/EmployeeCreateParams'
import Employee from '@models/Employee'
import Contract from '@models/Contract';
import errorThrower from '@utils/errorThrower'
import { Transaction } from "sequelize";
import { db } from '@config/database';
import employeeRepository from '../../repositories/employee/employee'
import { ConvertFormatDate, ConvertFormatDateNulllable } from '@services/convert-date/converterDate';

const createEmployee = async (payload: EmployeeCreateParams) => {
   const { contract_type_id, start_date, end_date, birth_date, ...employeeData } = payload

   const transaction: Transaction = await db.transaction();

   try {

      const isAnyEmployee = await employeeRepository.findOneEmployeeByEmployeeNumber(employeeData.employee_id)

      if (isAnyEmployee){
         throw new Error('Employee number already exists.')
      }

      const newEmployee = await Employee.create({...employeeData, birth_date: ConvertFormatDate(birth_date), status: 'active'}, { transaction });

      await Contract.create(
         {
           employee_id: newEmployee.id, 
           contract_type_id: contract_type_id,
           start_date: ConvertFormatDate(start_date),
           end_date: ConvertFormatDateNulllable(end_date),
         },
         { transaction }
      )
      
      await transaction.commit()

      return employeeRepository.findEmployeeById(newEmployee.id)
   } catch (err: any) {
      await transaction.rollback()
      throw errorThrower(err)
   }
}

export default createEmployee
