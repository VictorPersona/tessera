import type { TenantExecutor } from "../../../../../packages/db/executor.js";

export const documentRepository =(executor:TenantExecutor)=>{

const readDocument = async (documentId: string) => {
  const text = 'SELECT * from documents where id=$1';
  const values = [documentId];
 return await executor.PoolClient.query(text,values)
};

return {
  readDocument
}
}

