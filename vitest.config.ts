import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 60,
      },
      exclude: [
           "dist/**",
        "node_modules/**",
        "codegen.ts",
        "src/gql/generated.ts",
        "eslint.config.js",  
        "vitest.config.ts", 
        "**/*.d.ts",        
      ],
    },
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
  },
});
