import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

type Template = {path: string; contents: string};
const templates: Template[] = [
  {
    path: 'package.json',
    contents: JSON.stringify(
      {
        name: 'my-new-project',
        version: '0.1.0',
        private: true,
        scripts: {"build": "tsc",
    "example": "ts-node usage-example.ts",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"},
        devDependencies: {
          "@types/node": "^24.10.1",
          "@typescript-eslint/eslint-plugin": "^8.47.0",
          "@typescript-eslint/parser": "^8.47.0",
          "@vitest/coverage-v8": "4.0.10",
          "eslint": "^9.39.1",
          "eslint-config-prettier": "^10.1.8",
          "eslint-plugin-prettier": "^5.5.4",
          "prettier": "^3.6.2",
          "ts-node": "^10.9.0",
          "typescript": "^5.9.3",
          "vitest": "^4.0.10"
        },
      },
      null,
      2
    ),
  },
  {
    path: 'eslint.config.js',
    contents: `import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default defineConfig([
  globalIgnores(['node_modules/*', 'coverage/*', '**/vitest.config.ts']),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {sourceType: 'module', ecmaVersion: 'latest'},
    },
    plugins: {
      prettier,
      '@typescript-eslint': tseslint,
    },
    rules: {'prettier/prettier': 'error'},
  },
]);`
  },
  {
    path: 'tsconfig.json',
    contents: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["*.ts", "**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
`},
  {
    path: 'vitest.config.ts',
    contents: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        '**/*.example.*',
        '**/usage-example.*',
        '**/simple-example.*'
      ]
    }
  }
});
`},
];

for (const template of templates) {
  const absolute = resolve(process.cwd(), template.path);
  if (existsSync(absolute)) {
    console.log(`Skipping ${template.path} (already exists)`);
    continue;
  }
  mkdirSync(dirname(absolute), {recursive: true});
  writeFileSync(absolute, template.contents, 'utf8');
  console.log(`Created ${template.path}`);
}