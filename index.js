import base from './configs/base.js';
import react from './configs/react.js';
import test from './configs/test.js';
import e2e from './configs/e2e.js';
import prettier from 'eslint-config-prettier';

export { base, react, test, e2e };

/**
 * Recommended flat config: every preset composed in order, with
 * `eslint-config-prettier` applied last to switch off rules that would
 * conflict with Prettier. Spread it directly in `eslint.config.mjs`:
 *
 *   import openmrs from '@openmrs/eslint-config';
 *   export default [{ ignores: ['dist/**'] }, ...openmrs];
 *
 * To drop a preset (e.g. a non-React library), compose the named exports
 * yourself instead: `import { base, test } from '@openmrs/eslint-config'`.
 */
export default [...base, ...react, ...test, ...e2e, prettier];
