import { expect, test } from "vitest";
import { withSystem } from "../packages/db/executor.js";

test("SMOKE TEST", async () => {
  await withSystem(async (executor) => {
    expect(
      (await executor.PoolClient.query("SELECT 1 AS result")).rows[0].result,
    ).toBe(1);
  });
});
