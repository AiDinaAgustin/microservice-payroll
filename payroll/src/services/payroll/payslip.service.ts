import { IPayslip } from '@interfaces/payroll/IPayslip'
import payslipRepository from '../../repositories/payroll/payslip.repository'
import attendanceDeductionRepository from '../../repositories/payroll/attendanceDeduction.repository'
import salaryRepository from '../../repositories/payroll/salary.repository'
import errorThrower from '@utils/errorThrower'

export const createPayslip = async (payload: Partial<IPayslip>) => {
  try {
    console.log(`[PAYSLIP] Creating payslip for employee ${payload.employee_id}, period ${payload.period}`);
    
    // Check if payslip for this employee and period already exists
    const existingPayslip = await payslipRepository.findByEmployeeIdAndPeriod(
      payload.employee_id!, 
      payload.period!, 
      payload.tenant_id!
    );
    
    if (existingPayslip) {
      throw new Error('Payslip for this employee and period already exists');
    }
    
    // Get salary data for this employee and period
    const salaryData = await salaryRepository.findByEmployeeIdAndPeriod(
      payload.employee_id!,
      payload.period!,
      payload.tenant_id!
    );
    
    if (!salaryData) {
      throw new Error('No salary data found for this employee and period');
    }
    
    console.log(`[PAYSLIP] Found salary data: Base salary ${salaryData.base_salary} for period ${salaryData.period}`);
    
    // Get attendance deductions for this period
    const deduction = await attendanceDeductionRepository.findByEmployeeAndPeriod(
      payload.employee_id!,
      payload.period!,
      payload.tenant_id!
    );
    
    const deductionAmount = deduction ? Number(deduction.deduction_amount) : 0;
    console.log(`[PAYSLIP] Found deduction: ${deductionAmount} for employee ${payload.employee_id}`);
    
    // Calculate net salary
    const baseSalary = Number(salaryData.base_salary);
    const netSalary = baseSalary - deductionAmount;
    
    console.log(`[PAYSLIP] Final payslip: Base: ${baseSalary}, Deductions: ${deductionAmount}, Net: ${netSalary}`);
    
    // Create complete payslip object
    const completePayslip: IPayslip = {
      employee_id: payload.employee_id!,
      tenant_id: payload.tenant_id!,
      period: payload.period!,
      base_salary: baseSalary,
      total_deductions: deductionAmount,
      net_salary: netSalary,
      created_by: payload.created_by
    };
    
    return await payslipRepository.create(completePayslip);
  } catch (err: any) {
    console.error(`[PAYSLIP ERROR] Error creating payslip: ${err.message}`);
    throw errorThrower(err);
  }
}

export const findAllPayslip = async (params: any) => {
  try {
    // Default to current month-year if period not provided
    if (!params.period) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      params.period = `${month}-${year}`;
    }
    
    return await payslipRepository.findAll(params);
  } catch (err: any) {
    throw errorThrower(err);
  }
}

export const findPayslipById = async (id: string, tenantId: string) => {
  try {
    const payslip = await payslipRepository.findById(id, tenantId);
    if (!payslip) throw new Error('Payslip not found');
    return payslip;
  } catch (err: any) {
    throw errorThrower(err);
  }
}