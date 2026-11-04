import { randomUUID } from "node:crypto";
import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import {
  INSERT_INTO_DOCUMENTS,
  SELECT_FROM_DOCUMENTS,
} from "./documents.queries.js";
import type { DocumentRepository, DocumentRow } from "./documents.types.js";

const documentRepository = (executor: TenantExecutor): DocumentRepository => {
  const readDocument = async (
    documentId: string,
  ): Promise<DocumentRow | null> => {
    try {
      const text = SELECT_FROM_DOCUMENTS;
      const values = [documentId, executor.tenantId];
      const result = (
        await executor.PoolClient.query<DocumentRow>(text, values)
      ).rows[0];
      return result ?? null;
    } catch (error) {
      executor.PGError(error);
    }
  };

  const createDocument = async (data: string): Promise<string> => {
    try {
      const text = INSERT_INTO_DOCUMENTS;
      const id = randomUUID();
      const values = [id, executor.tenantId, data];
      await executor.PoolClient.query(text, values);
      return id;
    } catch (error) {
      executor.PGError(error);
    }
  };
  return {
    readDocument,
    createDocument,
  };
};

export default documentRepository;
