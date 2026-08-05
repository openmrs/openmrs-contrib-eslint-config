import reactHooks from 'eslint-plugin-react-hooks';

/**
 * React preset.
 *
 * Core only enforced rules-of-hooks (NOT the full recommended set, so no
 * exhaustive-deps). Kept to that exact scope for zero-diff. Adding
 * react-hooks/exhaustive-deps or eslint-plugin-jsx-a11y here would be a
 * breaking change under the versioning policy in the README; candidates ship
 * in an opt-in preset first.
 */
export default [
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
    },
  },
];
