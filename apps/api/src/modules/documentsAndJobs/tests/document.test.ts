import { randomUUID } from "node:crypto";
import { afterAll, expect, test } from "vitest";
import {
  closePool,
  withSystem,
} from "../../../../../../packages/db/executor.js";
import documentsService from "../documents.service.js";
import {
  ADD_JOBS_TEST_CONSTRAINT,
  CHECK_DOCUMENTS_TEST,
  DROP_JOBS_TEST_CONSTRAINT,
  REMOVE_DOCUMENTS_TEST,
  REMOVE_JOBS_TEST,
} from "./docutest.queries.js";

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

test("Two concurrent service calls for different tenants each see only their own rows.", async () => {
  const tenant1 = randomUUID();
  const tenant2 = randomUUID();
  try {
    const document1 = documentsService.createDocument(tenant1, "TENANT_1_DATA");
    const document2 = documentsService.createDocument(tenant2, "TENANT_2_DATA");
    const [t1Id, t2Id] = await Promise.all([document1, document2]);
    await Promise.all([
      (async () => {
        expect(
          (await documentsService.getDocument(tenant1, t1Id)).tenant_id,
        ).toBe(tenant1);
        await expect(
          documentsService.getDocument(tenant1, t2Id),
        ).rejects.toThrow("Requested document not found");
      })(),
      (async () => {
        expect(
          (await documentsService.getDocument(tenant2, t2Id)).tenant_id,
        ).toBe(tenant2);
        await expect(
          documentsService.getDocument(tenant2, t1Id),
        ).rejects.toThrow("Requested document not found");
      })(),
    ]);
  } finally {
    await withSystem(async (executor) => {
      await executor.PoolClient.query(REMOVE_JOBS_TEST, [tenant1]);
      await executor.PoolClient.query(REMOVE_DOCUMENTS_TEST, [tenant1]);

      await executor.PoolClient.query(REMOVE_JOBS_TEST, [tenant2]);
      await executor.PoolClient.query(REMOVE_DOCUMENTS_TEST, [tenant2]);
    });
  }
});
