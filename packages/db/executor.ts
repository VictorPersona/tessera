import { log } from "node:console";
import { Pool, type PoolClient, type QueryResult } from "pg";

const TENANT_BRAND: unique symbol = Symbol("tenant");

const SYSTEM_BRAND: unique symbol = Symbol("system");

export type TenantExecutor = {
  tenantId: string;
  readonly [TENANT_BRAND]: true;
  PoolClient: PoolClient;
};
export type SystemExecutor = {
  PoolClient: PoolClient;
  readonly [SYSTEM_BRAND]: true;
};
const pool = new Pool();
const createConnection = async () => await pool.connect();

export const withTenant = async (
  tenantId: string,
  transactionToRun: (executor: TenantExecutor) => Promise<QueryResult<any>>,
): Promise<void> => {
  const executor = {
    tenantId,
    [TENANT_BRAND]: true as const,
    PoolClient: await createConnection(),
  };
  try {
    await executor.PoolClient.query("BEGIN");
    await transactionToRun(executor);
    await executor.PoolClient.query("COMMIT");
  } catch (error) {
    
    try {
      await executor.PoolClient.query("ROLLBACK");
     
    } catch (error) {
      const  err = error instanceof Error ? error : true; 
       executor.PoolClient.release(err)
    }finally{
      throw error;
    }
    
  } finally {
    executor.PoolClient.release();
  }
};
export const withSystem = async (
  transactionToRun: (executor: SystemExecutor) => Promise<QueryResult<any>>,
): Promise<void> => {
  const executor = {
    [SYSTEM_BRAND]: true as const,
    PoolClient: await createConnection(),
  };

  try {
    await executor.PoolClient.query("BEGIN");
    await transactionToRun(executor);
    await executor.PoolClient.query("COMMIT");
  } catch (error) {
    await executor.PoolClient.query("ROLLBACK");
    throw error;
  } finally {
    executor.PoolClient.release();
  }
};


