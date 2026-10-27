import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const pgRegisteredPath = {
  name: "pg",
  message:
    'pg may only be imported inside packages/db and the two composition roots: "apps/api/app.*" "apps/index.*","apps/worker/src/main.*", Nothing else may import it directly.',
};

// const tesseraDBRegisteredPath = {
//   name: "@tessera/db",
//   message:
//     "Imports from @tessera/db may only be imported inside the repository and query files. Nothing else may import it directly",
// };

const tesseraDBRegisteredPatternAllowed = {
  group: ["**/packages/db/**", "!**/packages/db/public.**"],
  allowTypeImports: true,
  message:
    "Imports from tessera/db may only be imported inside the service and query files. Nothing else may import it directly",
};

const tesseraDBRegisteredPattern = {
  group: ["**/packages/db/**"],
  allowTypeImports: true,
  message:
    "Imports from tessera/db may only be imported inside the service and query files. Nothing else may import it directly",
};

export default defineConfig(
  { ignores: ["dist/**/*"] },
  {
    files: ["**/*.{js,ts}"],

    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
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
          patterns: [tesseraDBRegisteredPattern],
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
          patterns: [tesseraDBRegisteredPatternAllowed],
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
          patterns: [tesseraDBRegisteredPatternAllowed],
        },
      ],
    },
  },
  {
    files: [
      "**/packages/db/**/*",
      "apps/api/app.*",
      "apps/index.*",
      "apps/worker/src/main.*",
    ],
    rules: {
      "no-restricted-imports": ["off"],
    },
  },
);
