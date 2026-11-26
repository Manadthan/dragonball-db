import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["tests/e2e/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='getByRole'][arguments.0.value=/^(alert|status)$/]:not(MemberExpression[property.name='filter'] > CallExpression.object)",
          message:
            'getByRole("status" | "alert") trouve tous les messages de la page : écrire getByRole("status").filter({ hasText: "…" }).',
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
]);
