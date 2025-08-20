// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.node }
    },
    rules: {
      "no-console": ["error", { allow: ["info", "warn", "error"] }]
    }
  }
];
