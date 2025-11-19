import {defineConfig, globalIgnores} from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default defineConfig([globalIgnores(["node_modules/*", "coverage/*", "**/vitest.config.ts"]),{

  files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',

      },
    },
    
    plugins: {
      prettier: prettier,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Customize if needed
      'prettier/prettier': 'error',
    },
    
  }]);
  