import { randomUUID } from "crypto";
import type { TenantExecutor } from "../../../../../packages/db/executor.js";
import {
  INSERT_INTO_DOCUMENTS,
  SELECT_FROM_DOCUMENTS,
} from "./documents.queries.js";
import type { DocumentRow } from "./documents.types.js";
import { throwAppropriateError } from "../../../../../packages/db/postgres.errormapping.js";

export const documentRepository = (executor: TenantExecutor) => {
  const readDocument = async (
    documentId: string,
  ): Promise<DocumentRow | null> => {
    const text = SELECT_FROM_DOCUMENTS;
    const values = [documentId, executor.tenantId];
    const result = (await executor.PoolClient.query<DocumentRow>(text, values))
      .rows[0];
    return result ?? null;
  };

  const createDocument = async (data: string): Promise<string> => {
    try {
      const text = INSERT_INTO_DOCUMENTS;
      const id = randomUUID();
      const values = [id, executor.tenantId, data];
      await executor.PoolClient.query(text, values);
      return id;
    } catch (error) {
      throwAppropriateError(error);
    }
  };
  return {
    readDocument,
    createDocument,
  };
};
