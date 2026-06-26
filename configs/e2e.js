import playwright from 'eslint-plugin-playwright';

/**
 * End-to-end (Playwright) preset, scoped to e2e spec files.
 *
 * NOTE: core also set `testing-library/prefer-screen-queries: off` for e2e
 * files. That is omitted here: the testing-library plugin is not loaded for e2e
 * files, and referencing a rule from an unregistered plugin is a hard error in
 * flat config rather than a silent no-op.
 */
export default [
  { ...playwright.configs['flat/recommended'], files: ['e2e/**/*.spec.ts'] },
];
