module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', 'node_modules', 'src/api/generated', '*.config.*'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // features must not import from each other; use components/, lib/, api/ instead
    'no-restricted-imports': ['error', { patterns: [{ group: ['@/features/*/*'], message: 'Import a feature only through its index.ts, and never from another feature.' }] }],
  },
  overrides: [{ files: ['src/app/router/**', 'src/features/*/index.ts', 'src/**/*.test.*'], rules: { 'no-restricted-imports': 'off' } }],
};
