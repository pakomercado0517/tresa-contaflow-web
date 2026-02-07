import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import next from "eslint-config-next";
import prettier from "eslint-config-next";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...next,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Templates y skills de agentes (no son código de la app)
    ".agents/**",
  ]),
]);

export default eslintConfig;
