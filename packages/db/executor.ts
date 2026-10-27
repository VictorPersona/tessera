import { Pool, type PoolClient } from "pg";

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

const runTransaction = async <T, E extends TenantExecutor | SystemExecutor>(
  executor: E,
  transactionToRun: (executor: E) => Promise<T>,
): Promise<T> => {
  let rollBackFailed = false;
  try {
    await executor.PoolClient.query("BEGIN");
    const result = await transactionToRun(executor);
    await executor.PoolClient.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await executor.PoolClient.query("ROLLBACK");
    } catch (_errorObj) {
      rollBackFailed = true;
    }
    throw error;
  } finally {
    if (rollBackFailed) {
      executor.PoolClient.release(true);
    } else {
      executor.PoolClient.release();
    }
  }
};

export const withTenant = async <T>(
  tenantId: string,
  transactionToRun: (executor: TenantExecutor) => Promise<T>,
): Promise<T> => {
  const executor = {
    tenantId,
    [TENANT_BRAND]: true as const,
    PoolClient: await createConnection(),
  };

  return runTransaction(executor, transactionToRun);
};
export const withSystem = async <T>(
  transactionToRun: (executor: SystemExecutor) => Promise<T>,
): Promise<T> => {
  const executor = {
    [SYSTEM_BRAND]: true as const,
    PoolClient: await createConnection(),
  };

  return await runTransaction(executor, transactionToRun);
};
