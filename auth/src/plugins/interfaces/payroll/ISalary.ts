export interface ISalary {
  id?: string;
  employee_id: string;
  tenant_id: string;
  base_salary: number;
  allowances: number;
  period: Date;
  effective_date: Date;
  status: string;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}