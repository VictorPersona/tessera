import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import publicDb from "../../../../../packages/db/public.db.js";
import { AppError } from "../../utils/response.js";
import jobsRepository from "../jobs/jobs.repository.js";
import { documentRepository } from "./documents.repository.js";

const getDocument = async (tenantId: string, id: string) => {
  return await publicDb.withTenant(
    tenantId,
    async (executor: TenantExecutor) => {
      const documentRepo = documentRepository(executor);

      const document = await documentRepo.readDocument(id);
      if (!document)
        throw new AppError(
          404,
          "DOCUMENT_NOT_FOUND",
          "Requested document not found",
        );
      return document;
    },
  );
};

const createDocument = async (tenantId: string, input: string) => {
  return await publicDb.withTenant(
    tenantId,
    async (executor: TenantExecutor) => {
      const documentRepo = documentRepository(executor);
      const jobRepo = jobsRepository(executor);

      const documentId = await documentRepo.createDocument(input);

      return await jobRepo.createJob(documentId, input);
    },
  );
};

export default {
  getDocument,
  createDocument,
};
