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
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',  // Disable explicit return type
      '@typescript-eslint/no-explicit-any': 'off',  // Allow 'any' type
      '@typescript-eslint/no-unused-vars': 'off',  // Disable TypeScript-specific unused variable checks
      'no-unused-vars': 'off',  // Disable unused variable checks
      '@typescript-eslint/ban-ts-comment': 'off',  // Disable ts-comment rule
      '@typescript-eslint/no-empty-object-type': 'off',  // Disable empty object type rule
      'no-undef': 'off',  // Disable undefined variable checks
      'no-console': 'off',  // Allow console statements
      'no-debugger': 'off',  // Allow debugger statements
      'no-shadow': 'off',  // Disable shadowing of variable names
      'eqeqeq': 'off',  // Disable the requirement to use === and !==
      'curly': 'off',  // Disable the requirement for curly braces in control statements
      'semi': 'off',  // Allow missing semicolons
      'quotes': 'off',  // Disable enforcing quotes style
      'no-implicit-coercion': 'off',  // Disable implicit coercion checks
      'no-magic-numbers': 'off',  // Disable magic number checks
      'prefer-const': 'off',  // Disable enforcing const declaration
    },
  }),
];

export default eslintConfig;
