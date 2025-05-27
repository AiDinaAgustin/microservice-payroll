export interface UpdateContractTypeParams {
   tenantId? : string,
   name: string,
   status: "active" | "inactive"
   isPermanent: boolean
}
