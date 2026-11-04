import { describe, expect, it } from "vitest";
import type { TenantExecutor } from "../../../../../../packages/db/executor.js";
import { makeDocumentsService } from "../documents.service.js";
import type { DocumentRepository, DocumentRow } from "../documents.types.js";
import type { JobsRepository } from "../jobs.types.js";

const dummyExecutor = {} as unknown as TenantExecutor;

const fakeWithTenant = async <T>(
  _tenantId: string,
  fn: (executor: TenantExecutor) => Promise<T>,
): Promise<T> => fn(dummyExecutor);

const makeFakes = () => {
  const documents: DocumentRow[] = [];
  const jobs: { documentId: string; data: string }[] = [];

  const fakeDocuments: DocumentRepository = {
    readDocument: async (id) => documents.find((d) => d.id === id) ?? null,
    createDocument: async (data) => {
      const id = `doc-${documents.length + 1}`;
      documents.push({ id, tenant_id: "t1", data, created_at: null });
      return id;
    },
  };

  const fakeJobs: JobsRepository = {
    createJob: async (documentId, data) => {
      jobs.push({ documentId, data });
      return `job-${jobs.length}`;
    },
  };

  const service = makeDocumentsService({
    withTenant: fakeWithTenant,
    documentRepository: () => fakeDocuments,
    jobsRepository: () => fakeJobs,
  });

  return { service, documents, jobs };
};

describe("documents service", () => {
  it("createDocument creates the document, then a job for that same document id", async () => {
    const { service, documents, jobs } = makeFakes();

    const id = await service.createDocument("t1", "hello");

    expect(documents).toHaveLength(1);
    expect(id).toBe(documents[0]?.id);
    expect(jobs).toEqual([{ documentId: id, data: "hello" }]);
  });

  it("getDocument returns the document when it exists", async () => {
    const { service } = makeFakes();
    const id = await service.createDocument("t1", "hello");

    await expect(service.getDocument("t1", id)).resolves.toMatchObject({
      id,
      data: "hello",
    });
  });

  it("getDocument throws a 404 AppError when the repository finds nothing", async () => {
    const { service } = makeFakes();

    await expect(service.getDocument("t1", "missing")).rejects.toMatchObject({
      statusCode: 404,
      code: "DOCUMENT_NOT_FOUND",
    });
  });
});
