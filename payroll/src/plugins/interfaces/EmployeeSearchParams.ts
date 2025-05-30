export interface EmployeeSearchParams {
   tenantId?: string;
   keyword?: string;
   limit: number;
   page: number;
   role?: string[];
   position?: string[];
   department?: string[];
   contractType?: string[];
   status?: string[];
   sortBy?: 'name' | 'status';
   sortOrder?: 'ASC' | 'DESC';
   isOnleave?: boolean,
   isBirthDate?: boolean
}
export interface EmployeeOptionParams {
   limit: number
   tenantId?: string
   keyword?: string
   employeeId?: string
   managerId?: string
   supervisorId?: string
   mentorId?: string
   leadId?: string
}

export interface EmployeeEndContractParams {
   tenant_id: string
}

export interface EmployeeWhatsOnTodayParams {
   tenant_id: string,
   position?: string[],
   isOnleave: boolean,
   isBirthDate: boolean
}
export interface StatusEmployeeParams {
   limit: number;
   page: number;
   position?: string[];
   status?: string[];
   sortBy?: 'name' | 'status';
   sortOrder?: 'ASC' | 'DESC';
}



export interface BirthEmployeeParams {
   limit: number;
   page: number;
   position?: string[];
   status?: string[];
   sortBy?: 'name' | 'status';
   sortOrder?: 'ASC' | 'DESC';
}

export interface StatusEmployeeParams {
   limit: number;
   page: number;
   position?: string[];
   status?: string[];
   sortBy?: 'name' | 'status';
   sortOrder?: 'ASC' | 'DESC';
}



export interface BirthEmployeeParams {
   limit: number;
   page: number;
   position?: string[];
   status?: string[];
   sortBy?: 'name' | 'status';
   sortOrder?: 'ASC' | 'DESC';
}
