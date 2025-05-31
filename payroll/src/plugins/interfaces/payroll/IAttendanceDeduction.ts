export interface IAttendanceDeduction {
  id?: string;
  employee_id: string;
  tenant_id: string;
  period: string;
  total_late_minutes: number;
  deduction_amount: number;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}