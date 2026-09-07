import importRestrictions from './import-restrictions.js';

const message =
  'Use the O3 modal system: register the modal in routes.json and launch it with showModal(). ' +
  'See https://o3-docs.openmrs.org/en-US/docs/modal-system/';

/** Opt-in modal conventions for applications running in the O3 app shell. */
export default [
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...importRestrictions,
          paths: [
            ...importRestrictions.paths,
            {
              name: '@carbon/react',
              importNames: ['Modal', 'ComposedModal'],
              allowTypeImports: true,
              message,
            },
          ],
          patterns: [
            {
              regex:
                '^@carbon/react/(?:es|lib)/components/(?:Modal(?:/(?:index|Modal))?|ComposedModal(?:/(?:index|ComposedModal))?)(?:\\.js)?$',
              importNames: ['default', 'Modal', 'ComposedModal'],
              allowTypeImports: true,
              message,
            },
          ],
        },
      ],
    },
  },
];
