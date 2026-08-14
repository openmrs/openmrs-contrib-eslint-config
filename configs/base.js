import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

/**
 * Base preset: TypeScript + import hygiene + OpenMRS import restrictions.
 *
 * Ported from openmrs-esm-core's .eslintrc to be a zero-diff starting point for
 * adopting repositories. The disabled-rules block mirrors core "to keep the diff
 * small". Tightening any of these defaults is a breaking change under the
 * versioning policy in the README: candidate rules ship in an opt-in preset in
 * a minor release and are promoted into the defaults in a major.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      // core only set `env: node`. O3 source is browser + node, and adding
      // globals can only *reduce* no-undef errors, so this stays zero-diff.
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // --- Disabled to match core's current effective ruleset (adoption = no-op) ---
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      // core's `ban-types: off` was SPLIT into three rules in typescript-eslint v8:
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      // --- Enforced (verbatim from core) ---
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'import/no-duplicates': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unsafe-optional-chaining': 'off',
      'no-extra-boolean-cast': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: "Import specific methods from `lodash`. e.g. `import map from 'lodash/map'`",
            },
            {
              name: 'lodash-es',
              importNames: ['default'],
              message: "Import specific methods from `lodash-es`. e.g. `import { map } from 'lodash-es'`",
            },
            {
              name: 'carbon-components-react',
              message: "Import from `@carbon/react` directly. e.g. `import { Toggle } from '@carbon/react'`",
            },
            {
              name: '@carbon/icons-react',
              message: "Import from `@carbon/react/icons`. e.g. `import { ChevronUp } from '@carbon/react/icons'`",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      // Vitest mocks often need a value import and its type from the same
      // module. Allow `typeof import(...)` annotations in tests so
      // `consistent-type-imports` does not force a duplicate namespace import.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    // `require()` is allowed only in the CommonJS tooling, config, and mock files below.
    // Everywhere else, `@typescript-eslint/no-require-imports` stays at the
    // `error` that typescript-eslint's recommended preset sets. The tooling globs
    // come from core and patient-chart; mocks cover every extension because O3
    // repositories commonly keep TypeScript fixtures there.
    files: [
      '**/*.config.js',
      '**/*-config.js',
      '**/karma.conf.js',
      '**/protractor.conf.js',
      '**/tools/**/*.js',
      '**/setup-tests.js',
      '**/__mocks__/**',
      '**/*.cjs',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
