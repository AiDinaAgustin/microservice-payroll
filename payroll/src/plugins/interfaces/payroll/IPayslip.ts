export interface IPayslip {
  id?: string;
  employee_id: string;
  tenant_id: string;
  period: string; // Changed from Date to string
  base_salary: number;
  total_deductions: number;
  net_salary: number;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}