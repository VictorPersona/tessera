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

export const withTenant = async (tenantId: string): Promise<TenantExecutor> => {
  return {
    tenantId,
    [TENANT_BRAND]: true as const,
    PoolClient: await createConnection(),
  };
};
export const withSystem = async (): Promise<SystemExecutor> => {
  return {
    [SYSTEM_BRAND]: true as const,
    PoolClient: await createConnection(),
  };
};

export const releaseTenant = (Executor: TenantExecutor | SystemExecutor) => {
  Executor.PoolClient.release();
};
