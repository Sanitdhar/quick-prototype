import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Single repo-wide flat config. Every ts-* workspace package is linted from
// here with type-aware rules (via `projectService`) instead of each package
// carrying its own eslint config — see docs/STACK.md for why.
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.venv/**',
      '**/__pycache__/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Root-level JS config files aren't part of any tsconfig `include`, so
    // they can't get type-aware linting from the project service — drop back
    // to non-type-checked rules just for these instead of erroring.
    files: ['*.config.js', '*.config.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.config.{js,ts}', '**/*.test.{ts,tsx}', '**/vite.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  prettier,
);
