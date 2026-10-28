import { randomUUID } from "node:crypto";
import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import { INSERT_INTO_JOBS } from "./jobs.queries.js";


export default (executor: TenantExecutor) => {
  const createJob = async (documentId: string, data: string) => {
    const text = INSERT_INTO_JOBS;
    const id = randomUUID();
    const values = [id, executor.tenantId, documentId, data];
     await executor.PoolClient.query(text, values);
     return id;
  };
  return {
    createJob,
  };
};
