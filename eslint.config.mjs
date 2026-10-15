import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
export default defineConfig(
  { ignores: ["dist/**/*"] },
  {
    files: ["apps/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "pg",
              message:
                "pg may only be imported inside packages/db and the two composition rootes, apps/api/src/main.ts and apps/worker/src/main.ts. Nothing else may import it directly",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,ts}"],

    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.routes.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/*.repository.*", "**/*.schema.*", "**/*.queries.*"],
              message:
                "routes must call from a service,not from repository, schema or queries",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.repository.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "express",
              message:
                "repository must call from the schema object, dependencies only point downward",
            },
          ],
          patterns: [
            {
              group: ["**/*.routes.*", "**/*.service.*"],
              message:
                "repository must call from the schmea object, dependencies only point downward",
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      "**/packages/db/**/*",
      "apps/api/src/main.*",
      "apps/worker/src/main.*",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
);
