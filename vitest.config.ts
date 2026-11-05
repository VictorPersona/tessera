import { defineConfig } from "vitest/config";

// CHANGED: no setupFiles. vitest.setup.ts only ran dotenv, and @tessera/config
// now loads .env itself the first time anything imports it.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["**/*.unit.test.ts"],
          env: {
            NODE_ENV: "test",
            DATABASE_URL: "postgres://unit:unit@localhost:1/unit",
            S3_ACCESS_KEY_ID: "unit-test",
            S3_SECRET_ACCESS_KEY: "unit-test",
          },
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*.int.test.ts"],
          // integration uses the real env (.env locally): it needs the real DATABASE_URL
          globalSetup: ["./packages/db/tests/integrationGlobalSetup.ts"],
        },
      },
    ],
  },
});
