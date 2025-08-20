import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow React hooks optimization warnings to not block build
      "react-hooks/exhaustive-deps": "warn",
      // Allow stories files to have more flexibility
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true 
      }]
    }
  },
  {
    files: ["**/*.stories.*"],
    rules: {
      // More lenient rules for Storybook files
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
