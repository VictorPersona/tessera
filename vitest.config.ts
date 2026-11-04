import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"], //
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["**/*.unit.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*.int.test.ts"],
          globalSetup: ["./packages/db/tests/integrationGlobalSetup.ts"],
        },
      },
    ],
  },
});
