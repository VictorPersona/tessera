import { randomUUID } from "node:crypto"; // CHANGED: node:crypto, as everywhere else
import { afterAll, expect, test } from "vitest";
import documentsService from "../documents.service.js";
import {
  ADD_JOBS_TEST_DUPLICATE_CONSTRAINT,
  DELETE_REPTATIVE_DATA_ROWS,
  DROP_JOBS_TEST_DUPLICATE_CONSTRAINT,
} from "./docutest.queries.js";
import publicDb, { closePool } from "@tessera/db"; // CHANGED: by package name
import { ConflictError } from "@tessera/db/errors";

const { withSystem } = publicDb;

afterAll(async () => await closePool());

test('Inserting a duplicate unique key through a repository.Should get back a ConflictError whose cause.code is "23505"', async () => {
  await withSystem(async (executor) => {
    await executor.PoolClient.query(DROP_JOBS_TEST_DUPLICATE_CONSTRAINT);
    await executor.PoolClient.query(ADD_JOBS_TEST_DUPLICATE_CONSTRAINT);
  });
  const REPETATIVE_DATA = "REPETATIVE_DATA";
  try {
    await withSystem(async (executor) => {
      const query = DELETE_REPTATIVE_DATA_ROWS;
      const values = [REPETATIVE_DATA];
      await executor.PoolClient.query(query, values);
    });
    await documentsService.createDocument(randomUUID(), REPETATIVE_DATA);

    const error = await documentsService
      .createDocument(randomUUID(), REPETATIVE_DATA)
      .catch((error: unknown) => error);

    expect(error).toBeInstanceOf(ConflictError);
    if (error instanceof ConflictError) {
      expect(error.cause).toHaveProperty("code", "23505");
    }
  } finally {
    await withSystem(async (executor) => {
      await executor.PoolClient.query(DROP_JOBS_TEST_DUPLICATE_CONSTRAINT);
    });
  }
});
