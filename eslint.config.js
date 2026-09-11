const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const eslint = require('@eslint/js');

module.exports = [
  { ignores: ['dist/**', 'node_modules/**'] },
  eslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser, parserOptions: { project: './tsconfig.json', ecmaVersion: 'latest', sourceType: 'module' }, globals: { Office: 'readonly', OfficeAsyncResult: 'readonly', document: 'readonly', window: 'readonly', JSX: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly' } },
    plugins: { '@typescript-eslint': tseslint },
    rules: { ...tseslint.configs.recommended.rules, '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
  }
];
