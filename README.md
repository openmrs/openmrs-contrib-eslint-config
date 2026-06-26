# @openmrs/eslint-config

Standardized [ESLint](https://eslint.org/) configuration for OpenMRS O3 frontend modules.

This package centralizes the ESLint rules that were previously copy-pasted (and slowly drifting) across the `openmrs-esm-*` repositories. It ships as composable [flat-config](https://eslint.org/docs/latest/use/configure/configuration-files) presets and targets **ESLint 9+**.

## Installation

```sh
npm install --save-dev @openmrs/eslint-config eslint typescript
```

`eslint` and `typescript` are peer dependencies. Every ESLint plugin the presets need is a direct dependency of this package, so you do not need to install them yourself.

## Usage

Create an `eslint.config.js` (or `eslint.config.mjs`) at the root of your project and compose the presets you need:

```js
import openmrs from '@openmrs/eslint-config';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'coverage/**', '**/*.d.ts'] },
  ...openmrs.base,
  ...openmrs.react,
  ...openmrs.test,
  ...openmrs.e2e,
  prettier, // must be LAST: turns off formatting rules, since O3 runs Prettier separately
];
```

You can also import presets individually:

```js
import base from '@openmrs/eslint-config/base';
import react from '@openmrs/eslint-config/react';
```

## Presets

| Preset  | What it covers | Notable contents |
| ------- | -------------- | ---------------- |
| `base`  | TypeScript + import hygiene for all source files | `eslint:recommended`, `typescript-eslint/recommended`, `consistent-type-imports`, `no-console` (allows `warn`/`error`), and `no-restricted-imports` guards for `lodash` / `lodash-es` / Carbon |
| `react` | React components | `react-hooks/rules-of-hooks` |
| `test`  | Unit/integration tests (`**/*.test.{ts,tsx}`) | `jest-dom` and `testing-library` recommended rules |
| `e2e`   | Playwright specs (`e2e/**/*.spec.ts`) | `playwright/recommended` |

Each preset exports an array of flat-config objects, so spread it into your config.

## Migrating from a legacy `.eslintrc`

The `base` preset is intentionally a near-zero-diff port of `openmrs-esm-core`'s `.eslintrc`, so adopting it in an existing repo should not introduce new lint failures. To migrate:

1. Bump `eslint` to `>=9` and remove the per-plugin ESLint dev dependencies that this package now provides (`@typescript-eslint/*`, `eslint-plugin-import`, `eslint-plugin-react-hooks`, `eslint-plugin-jest-dom`, `eslint-plugin-testing-library`, `eslint-plugin-playwright`).
2. Delete `.eslintrc` / `.eslintignore` and add an `eslint.config.js` as shown above (flat config moves ignores into the config itself).
3. Run `npx eslint . --fix` and confirm the diff is limited to autofixes.

A couple of intentional differences from core's legacy config are documented inline in `configs/base.js`, most importantly the [typescript-eslint v8 rule renames](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/) (`ban-types` was split into three rules; `no-var-requires` was folded into `no-require-imports`).

## Versioning policy

This package follows [semantic versioning](https://semver.org/), with one project-specific rule that matters because O3 repos lint with `--max-warnings 0`:

- **Any change that can make a previously-passing repo fail CI is breaking.** Adding a rule, or raising a rule from `off`/`warn` to `error`, falls in this bucket.
- New or stricter rules are introduced as `warn` in a **minor** release first, giving repos a window to clean up, and promoted to `error` in a subsequent **major**.
- Loosening a rule, fixing a misconfiguration, or a dependency bump that does not change emitted findings is a **patch** or **minor** as appropriate.

When in doubt, prefer a slower ratchet. The goal is for upgrades to be safe to take without a red build.

## Contributing

Issues and pull requests are welcome. Please open an issue to discuss any rule change before sending a PR, since rule changes affect every consuming repository.

## License

[MPL-2.0](./LICENSE)
