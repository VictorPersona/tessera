import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import publicDb from "../../../../../packages/db/public.db.js";
import { AppError } from "../../utils/response.js";
import documentRepository from "./documents.repository.js";
import type { DocumentRepository } from "./documents.types.js";
import jobsRepository from "./jobs.repository.js";
import type { JobsRepository } from "./jobs.types.js";

type DocumentsServiceDeps = {
  withTenant: <T>(
    tenantId: string,
    fn: (executor: TenantExecutor) => Promise<T>,
  ) => Promise<T>;
  documentRepository: (ex: TenantExecutor) => DocumentRepository;
  jobsRepository: (ex: TenantExecutor) => JobsRepository;
};

export const makeDocumentsService = (deps: DocumentsServiceDeps) => {
  const createDocument = async (tenantId: string, input: string) => {
    return await deps.withTenant(tenantId, async (executor: TenantExecutor) => {
      const documentRepo = deps.documentRepository(executor);
      const jobRepo = deps.jobsRepository(executor);

      const documentId = await documentRepo.createDocument(input);

      await jobRepo.createJob(documentId, input);
      return documentId;
    });
  };
  const getDocument = async (tenantId: string, id: string) => {
    return await deps.withTenant(tenantId, async (executor: TenantExecutor) => {
      const documentRepo = deps.documentRepository(executor);

      const document = await documentRepo.readDocument(id);
      if (!document)
        throw new AppError(
          404,
          "DOCUMENT_NOT_FOUND",
          "Requested document not found",
        );
      return document;
    });
  };
  return { getDocument, createDocument };
};

export default makeDocumentsService({
  withTenant: publicDb.withTenant,
  documentRepository,
  jobsRepository,
});
