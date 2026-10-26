import { Pool } from "pg";
import {
  withSystem,
  type SystemExecutor,
  type TenantExecutor,
} from "../packages/db/executor.js";

const createTenant = (
  tenantDetails: { name: string },
  tenantExecutor: TenantExecutor,
) => {
  console.log(`${tenantDetails.name} logged`);
  console.log(tenantExecutor.tenantId);
};

const pool = new Pool();
const client = await pool.connect();

const brand = Symbol("tenant");

const tenantExecutor: TenantExecutor = {
  PoolClient: client,
  tenantId: "tenant-123",
  // @ts-expect-error Forged tenantExecutors should not work
  [brand]: true as const,
};

const systemExecutorObj: SystemExecutor = await withSystem();
// @ts-expect-error  A tenant function should only take a Tenant Executor
createTenant({ name: "Gaurav" }, systemExecutorObj);

//@ts-expect-error The raw pool must not be accepted
createTenant({ name: "Gaurav" }, pool);

client.release();
