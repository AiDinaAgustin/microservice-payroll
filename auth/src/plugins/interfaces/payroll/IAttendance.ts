export interface IAttendance {
  id?: string;
  employee_id: string;
  tenant_id: string;
  date: Date;
  status: string;
  check_in?: Date;
  check_out?: Date;
  late_minutes?: number;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}