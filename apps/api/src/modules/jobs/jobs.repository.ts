import type { TenantExecutor } from "../../../../../packages/db/executor.js";

export default (executor:TenantExecutor)=>{

    const createJob = async(data:string)=>{
    const text  = 'INSERT into jobs(data) values($1)'
    const values = [data]
        return await executor.PoolClient.query(text,values);
    }
    return {
        createJob
    }
}