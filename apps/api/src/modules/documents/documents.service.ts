import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import publicDb from "../../../../../packages/db/public.db.js";
import jobsRepository from "../jobs/jobs.repository.js";
import { documentRepository } from "./documents.repository.js";

const getDocument = async (tenantId: string, id: string) => {
  return await publicDb.withTenant(
    tenantId,
    async (executor: TenantExecutor) => {
      const documentRepo = documentRepository(executor);

      return await documentRepo.readDocument(id);
    },
  );
};

const createDocument = async (tenantId: string, input: string) => {
  return await publicDb.withTenant(
    tenantId,
    async (executor: TenantExecutor) => {
      const documentRepo = documentRepository(executor);
      const jobRepo = jobsRepository(executor);

      await documentRepo.createDocument(input);
      return await jobRepo.createJob(input);
    },
  );
};

export default {
  getDocument,
  createDocument,
};
