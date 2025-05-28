export interface PositionUpdateParams {
    tenantId?: string;
    departmentId?: string;
    name: string;
    status?: 'active' | 'inactive';
}