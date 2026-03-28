import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import tseslint from "typescript-eslint"

const lintMode = process.env.MDDA_LINT_MODE ?? "strict"
const isFast = lintMode === "fast"

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "user_gift/**",
      "ui-libraries/**",
      ".trae/**",
      "cases/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-explicit-any": isFast ? "warn" : "error",
    },
  },
  {
    files: ["next.config.js", "postcss.config.js", "tailwind.config.js", "**/*.config.js"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["eslint.config.mjs"],
    rules: {
      "no-undef": "off",
    },
  },
]
