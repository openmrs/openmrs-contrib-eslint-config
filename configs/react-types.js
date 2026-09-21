import tseslint from 'typescript-eslint';

/** Opt-in React type conventions, compatible with React 18 and 19 types. */
export default [
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'JSX.Element': { message: 'Use React.JSX.Element.' },
          },
        },
      ],
    },
  },
];
