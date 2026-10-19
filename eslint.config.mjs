import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import eslintjs from "@eslint/js";

const { node, jest } = globals;

export default defineConfig([
  eslintjs.configs.recommended,
  ...typescriptEslint.configs["flat/recommended"],
  {
    languageOptions: {
      globals: {
        ...node,
      },
      sourceType: "module",
      ecmaVersion: 2020,
    },

    plugins: { prettier },

    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "prettier/prettier": "error",
    },
  },
  {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],

    languageOptions: {
      globals: {
        ...jest,
      },
    },
  },
  globalIgnores(["**/dist"]),
]);
