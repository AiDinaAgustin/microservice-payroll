export interface EmployeeSearchParams {
   keyword?: string;
   limit: number;
   page: number;
   role?: string[]; 
   position?: string[]; 
   contractType?: string[]; 
   status?: string[]; 
}
