export interface DepartmentUpdateParams {
    tenantId?: string;
    name: string;
    status?: 'active' | 'inactive';
}