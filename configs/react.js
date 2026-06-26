import reactHooks from 'eslint-plugin-react-hooks';

/**
 * React preset.
 *
 * Core only enforced rules-of-hooks (NOT the full recommended set, so no
 * exhaustive-deps). Kept to that exact scope for zero-diff. Adding
 * react-hooks/exhaustive-deps and eslint-plugin-jsx-a11y is a good candidate
 * for a later minor release.
 */
export default [
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
