// eslint.config.js
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";
import { globalIgnores } from "eslint/config";

const disallowCommentsRule = {
  meta: {
    type: "problem",
    docs: { description: "Disallow comments (except allowlist)" },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};
    const allow = options.allow || [];
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          const re = allow.length ? new RegExp(`^\\s?(${allow.join("|")})`) : null;
          if (!re || !re.test(comment.value)) {
            context.report({
              loc: comment.loc,
              message: "Comments are forbidden",
              fix(fixer) {
                return fixer.remove(comment);
              },
            });
          }
        }
      },
    };
  },
};

export default [
  // global ignores (flat config)
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "src/gql/generated.ts",
    "src/generated",
  ]),

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.node,
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      custom: {
        rules: { "disallow-comments": disallowCommentsRule },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // keep your project rule
      "no-console": ["error", { allow: ["info", "warn", "error"] }],

      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0, maxBOF: 0 }],
      "custom/disallow-comments": ["error", { allow: ["TODO", "FIXME"] }],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  // tests are looser
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "custom/disallow-comments": "off",
    },
  },

  // typings can have comments
  {
    files: ["**/*.d.ts"],
    rules: {
      "custom/disallow-comments": "off",
    },
  },
];
