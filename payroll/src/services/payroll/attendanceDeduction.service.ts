import { IAttendanceDeduction } from '@interfaces/payroll/IAttendanceDeduction'
import attendanceDeductionRepository from '../../repositories/payroll/attendanceDeduction.repository'
import attendanceRepository from '../../repositories/payroll/attendance.repository'
import salaryRepository from '../../repositories/payroll/salary.repository'
import errorThrower from '@utils/errorThrower'

// Helper function to calculate working days in a month
const getWorkingDaysInMonth = (year: number, month: number): number => {
  // Default to 20 working days if calculation is complex
  return 20;
}

// Calculate deduction amount based on late minutes and salary
export const calculateDeduction = async (employeeId: string, tenantId: string, period: string, totalLateMinutes: number) => {
  try {
    console.log(`[DEDUCTION] Calculating deduction for employee ${employeeId}, period ${period}, total late minutes: ${totalLateMinutes}`);
    
    if (totalLateMinutes <= 0) {
      console.log('[DEDUCTION] No late minutes to calculate deduction for');
      return 0;
    }
    
    // Get employee's latest salary for the period
    const salaries = await salaryRepository.findByEmployeeId(employeeId, tenantId);
    console.log(`[DEDUCTION] Found ${salaries?.length || 0} salary records for employee`);
    
    if (!salaries || salaries.length === 0) {
      throw new Error('No salary information found for this employee');
    }
    
    // Get the matching period salary or the latest one
    let salary = salaries.find(s => s.period === period);
    if (!salary) {
      salary = salaries[0]; // Get the most recent salary
    }
    
    const baseSalary = Number(salary.base_salary);
    console.log(`[DEDUCTION] Using base salary: ${baseSalary} from period: ${salary.period}`);
    
    // Parse period to get month and year
    const [month, year] = period.split('-').map(Number);
    
    // Calculate working days in the month
    const workingDays = getWorkingDaysInMonth(year, month);
    console.log(`[DEDUCTION] Working days in month: ${workingDays}`);
    
    // Calculate work minutes per day and month
    const workMinutesPerDay = 8 * 60; // 8 hours = 480 minutes
    const totalWorkMinutesPerMonth = workingDays * workMinutesPerDay;
    console.log(`[DEDUCTION] Total work minutes per month: ${totalWorkMinutesPerMonth}`);
    
    // Calculate rate per minute
    const ratePerMinute = baseSalary / totalWorkMinutesPerMonth;
    console.log(`[DEDUCTION] Rate per minute: ${ratePerMinute}`);
    
    // Calculate deduction amount
    const deductionAmount = totalLateMinutes * ratePerMinute;
    console.log(`[DEDUCTION] Calculated deduction amount: ${deductionAmount}`);
    
    return Math.round(deductionAmount * 100) / 100; // Round to 2 decimal places
  } catch (err: any) {
    console.error(`[DEDUCTION ERROR] Error calculating deduction: ${err.message}`);
    throw errorThrower(err);
  }
}

export const createOrUpdateDeduction = async (employeeId: string, tenantId: string, period: string) => {
  try {
    console.log(`[DEDUCTION] Creating/updating deduction for employee ${employeeId}, period ${period}`);
    
    // Parse period to get month and year for attendance calculation
    const [month, year] = period.split('-').map(Number);
    
    // Calculate start and end date for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    console.log(`[DEDUCTION] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Get all attendances for this employee in the period
    const attendances = await attendanceRepository.findByEmployeeAndPeriod(employeeId, startDate, endDate);
    console.log(`[DEDUCTION] Found ${attendances?.length || 0} attendance records`);
    
    // Debug: show all attendance records
    attendances.forEach((attendance, index) => {
      console.log(`[DEDUCTION] Attendance #${index + 1}: Date: ${attendance.date}, Status: ${attendance.status}, Late minutes: ${attendance.late_minutes || 0}`);
    });
    
    // Sum up all late minutes
    let totalLateMinutes = 0;
    attendances.forEach(attendance => {
      if (attendance.status === 'late' && attendance.late_minutes) {
        console.log(`[DEDUCTION] Adding ${attendance.late_minutes} late minutes from ${attendance.date}`);
        totalLateMinutes += Number(attendance.late_minutes);
      }
    });
    
    console.log(`[DEDUCTION] Total late minutes calculated: ${totalLateMinutes}`);
    
    // Calculate deduction amount
    const deductionAmount = await calculateDeduction(employeeId, tenantId, period, totalLateMinutes);
    console.log(`[DEDUCTION] Deduction amount calculated: ${deductionAmount}`);
    
    // Check if deduction record already exists
    const existingDeduction = await attendanceDeductionRepository.findByEmployeeAndPeriod(employeeId, period, tenantId);
    
    if (existingDeduction) {
      console.log(`[DEDUCTION] Updating existing deduction record ID: ${existingDeduction.id}`);
      // Update existing record
      return await attendanceDeductionRepository.update(existingDeduction.id, tenantId, {
        total_late_minutes: totalLateMinutes,
        deduction_amount: deductionAmount
      });
    } else {
      console.log(`[DEDUCTION] Creating new deduction record`);
      // Create new record
      return await attendanceDeductionRepository.create({
        employee_id: employeeId,
        tenant_id: tenantId,
        period,
        total_late_minutes: totalLateMinutes,
        deduction_amount: deductionAmount
      });
    }
  } catch (err: any) {
    console.error(`[DEDUCTION ERROR] Error in createOrUpdateDeduction: ${err.message}`);
    throw errorThrower(err);
  }
}

export const findAllDeductions = async (params: any) => {
  try {
    return await attendanceDeductionRepository.findAll(params);
  } catch (err: any) {
    throw errorThrower(err);
  }
}

export const findDeductionById = async (id: string, tenantId: string) => {
  try {
    const deduction = await attendanceDeductionRepository.findById(id, tenantId);
    if (!deduction) throw new Error('Attendance deduction not found');
    return deduction;
  } catch (err: any) {
    throw errorThrower(err);
  }
}

export const deleteDeduction = async (id: string, tenantId: string) => {
  try {
    return await attendanceDeductionRepository.delete(id, tenantId);
  } catch (err: any) {
    throw errorThrower(err);
  }
}