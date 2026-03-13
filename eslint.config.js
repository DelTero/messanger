import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.ts', '**/*.tsx'],

    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs['recommended-typescript'],
      reactHooks.configs.flat.recommended,
    ],

    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  eslintConfigPrettier,
]);
