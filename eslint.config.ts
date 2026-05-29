import js from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierEslint from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    // 核心：忽略规则
    ignores: [
      'node_modules/**',
      '*/node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
      'public/**',
      'docs/.vitepress/dist/**',
      'docs/.vitepress/cache/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      semi: 'error',
      '@typescript-eslint/semi': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  tsEslint.configs.recommended,
  tsEslint.configs.stylistic,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tsEslint.parser } },
  },
  {
    plugins: { prettier: pluginPrettier },
    extends: [prettierEslint],
    rules: {
      'prettier/prettier': 'error',
    },
  },
]);
