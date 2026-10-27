
import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import publicDb from "../../../../../packages/db/public.db.js";
import { documentRepository } from "./documents.repository.js";

const getDocument = async (id: string) => {
   await publicDb.withTenant("Tenant1", async (executor:TenantExecutor)=>{
    const documentRepo = documentRepository(executor);

    return await documentRepo.readDocument(id);
  } );
  
};

const createDocument = async(tenantId:string, input:string)=>{
   
    await publicDb.withTenant(tenantId,async(executor:TenantExecutor)=>{
 const documentRepo = documentRepository(executor)
 return await documentRepo.createDocument(input)
    })
}

export default {
  getDocument,
  createDocument
};
