import { afterAll, expect, test } from "vitest";
import {
  closePool,
  withSystem,
} from "../../../../../../packages/db/executor.js";
import {
  ADD_JOBS_TEST_CONSTRAINT,
  CHECK_DOCUMENTS_TEST,
  DROP_JOBS_TEST_CONSTRAINT,
} from "./docutest.queries.js";
import documentsService from "../documents.service.js";
import { randomUUID } from "node:crypto";

afterAll(async () => await closePool());

test("a failure part-way leaves nothing behind", async () => {
  await withSystem(async (executor) => {
    await executor.PoolClient.query(DROP_JOBS_TEST_CONSTRAINT);
    await executor.PoolClient.query(ADD_JOBS_TEST_CONSTRAINT);
  });

  try {
    await expect(
      documentsService.createDocument(randomUUID(), "vitest_test_data"),
    ).rejects.toThrow(/check constraint "check_data"/);
    await withSystem(async (executor) => {
      expect(
        (await executor.PoolClient.query(CHECK_DOCUMENTS_TEST)).rowCount,
      ).toBe(0);
    });
  } finally {
    await withSystem(async (executor) => {
      await executor.PoolClient.query(DROP_JOBS_TEST_CONSTRAINT);
    });
  }
});
