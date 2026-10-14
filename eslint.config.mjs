import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
export default defineConfig({
  files: ["**/*.{js,ts}"],
  ignores: ["dist/"],
  extends: [js.configs.recommended, tseslint.configs.recommended],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
      typescript: require("@typescript/typescript6"),
    },
  },
});
