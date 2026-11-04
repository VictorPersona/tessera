import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const pgRegisteredPath = {
  name: "pg",
  message:
    'pg may only be imported inside packages/db and the two composition roots: "apps/api/app.*" "apps/api/index.*","apps/worker/src/main.*", Nothing else may import it directly.',
};

const tesseraDBRegisteredPattern = {
  regex: "^@tessera/db(/.*)?$",
  allowTypeImports: true,
  message:
    "Imports from tessera/db may only be imported inside the service and query files. Nothing else may import it directly",
};

const noRelativeIntoPackages = {
  group: ["**/packages/**"],
  message:
    "Import a package by its name (@tessera/db, @tessera/config, ...), never by a relative path into packages/: that skips its package.json exports.",
};

export default defineConfig(
  { ignores: ["**/dist/**"] }, //
  {
    files: ["**/*.{js,ts}"],

    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["vitest.config.ts", "vitest.setup.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    files: ["**/*"],

    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [pgRegisteredPath],
          patterns: [tesseraDBRegisteredPattern, noRelativeIntoPackages],
        },
      ],
    },
  },

  {
    files: ["**/*.routes.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [pgRegisteredPath],
          patterns: [
            {
              group: ["**/*.repository.*", "**/*.schema.*", "**/*.queries.*"],
              allowTypeImports: true,
              message:
                "routes must call from a service,not from repository, schema or queries",
            },

            tesseraDBRegisteredPattern,
            noRelativeIntoPackages,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*service.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [noRelativeIntoPackages],
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
            pgRegisteredPath,
            {
              name: "express",
              message:
                " please pass the data inside the functions to access them. dependencies only point downward",
            },
          ],
          patterns: [
            {
              group: ["**/*.routes.*", "**/*.service.*"],
              message:
                "please pass the data inside the functions to access them. Dependencies only point downward",
            },
            tesseraDBRegisteredPattern,
            noRelativeIntoPackages,
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.queries.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [pgRegisteredPath],
          patterns: [noRelativeIntoPackages],
        },
      ],
    },
  },
  {
    files: ["packages/db/**/*"],
    rules: {
      "no-restricted-imports": ["off"],
    },
  },
  {
    files: ["apps/api/app.*", "apps/api/index.*", "apps/worker/src/main.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [noRelativeIntoPackages] },
      ],
    },
  },
  {
    files: ["apps/api/src/middlewares/error.middleware.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [pgRegisteredPath],
          patterns: [
            {
              regex: "^@tessera/db(?!/errors$)",
              allowTypeImports: true,
              message:
                "The error middleware may import only @tessera/db/errors from tessera/db.",
            },
            noRelativeIntoPackages,
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.*"],
    rules: {
      "no-restricted-imports": ["off"],
    },
  },
);
