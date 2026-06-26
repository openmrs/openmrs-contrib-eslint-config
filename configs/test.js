import jestDom from 'eslint-plugin-jest-dom';
import testingLibrary from 'eslint-plugin-testing-library';

/**
 * Testing preset, scoped to test files.
 *
 * NOTE: core extended jest-dom/recommended *globally*; here it is scoped to test
 * files. This is behaviorally equivalent (jest-dom rules only fire on jest-dom
 * matchers, which live in tests) but it is not byte-identical to core.
 */
export default [
  { ...jestDom.configs['flat/recommended'], files: ['**/*.test.{ts,tsx}'] },
  { ...testingLibrary.configs['flat/react'], files: ['**/*.test.{ts,tsx}'] },
];
