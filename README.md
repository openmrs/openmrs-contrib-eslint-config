# @openmrs/eslint-config

Standardized [ESLint](https://eslint.org/) configuration for OpenMRS O3 frontend modules.

This package centralizes the ESLint rules that were previously copy-pasted (and slowly drifting) across the `openmrs-esm-*` repositories. It ships as composable [flat-config](https://eslint.org/docs/latest/use/configure/configuration-files) presets and targets **ESLint 9+**.

## Installation

```sh
npm install --save-dev @openmrs/eslint-config eslint typescript
```

`eslint` and `typescript` are peer dependencies. Every ESLint plugin the presets need is a direct dependency of this package, so you do not need to install them yourself.

## Usage

Create an `eslint.config.js` (or `eslint.config.mjs`) at the root of your project and spread the default export, which composes the default presets and applies `eslint-config-prettier` last for you:

```js
import openmrs from '@openmrs/eslint-config';

export default [
  { ignores: ['dist/**', 'coverage/**', '**/*.d.ts'] },
  ...openmrs,
];
```

The default export is `base` + `react` + `test` + `e2e` with `eslint-config-prettier` applied last (it turns off rules that would conflict with Prettier, which O3 runs separately). You do not need to install or import `eslint-config-prettier` yourself.

If you need to drop a preset (for example, a non-React library), compose the named exports yourself instead:

```js
import { base, test } from '@openmrs/eslint-config';

export default [
  { ignores: ['dist/**'] },
  ...base,
  ...test,
];
```

The named presets don't bundle `eslint-config-prettier`, but they enable no formatting rules of their own, so Prettier and ESLint still won't conflict. Each preset is also available as a subpath import (`@openmrs/eslint-config/base`, `/react`, `/test`, `/e2e`).

## Presets

| Preset  | What it covers | Notable contents |
| ------- | -------------- | ---------------- |
| `base`  | TypeScript + import hygiene for all source files | `eslint:recommended`, `typescript-eslint/recommended`, `consistent-type-imports` (permits `typeof import(...)` annotations in tests and `__mocks__`), `no-console` (allows `warn`/`error`), and `no-restricted-imports` guards for `lodash` / `lodash-es` / Carbon / the global `mutate` from `swr`; `require()` is allowed only in CommonJS tooling, config files, and `__mocks__` |
| `react` | React components | `react-hooks/rules-of-hooks` |
| `test`  | Unit/integration tests (`**/*.test.{ts,tsx}`) | `jest-dom` and `testing-library` recommended rules |
| `e2e`   | Playwright specs (`e2e/**/*.spec.ts`) | `playwright/recommended` |
| `reactTypes` (opt-in) | React types in TypeScript files | Rejects `JSX.Element` in favor of `React.JSX.Element` |

Each preset exports an array of flat-config objects, so spread it into your config.

### Opt-in React type conventions

Use `reactTypes` to prevent new `JSX.Element` annotations while preparing for React 19 types. `React.JSX.Element` also works with current React 18 types, so this does not require a runtime upgrade.

```js
import openmrs, { reactTypes } from '@openmrs/eslint-config';

export default [
  { ignores: ['dist/**'] },
  ...openmrs,
  ...reactTypes,
];
```

The preset is also available from `@openmrs/eslint-config/react-types`. It is not included in the default export. It checks `.ts`, `.tsx`, `.mts`, and `.cts` files and only restricts the type spelling `JSX.Element`; it is not a complete React 19 migration check.

There is no autofix: the rule matches the type's spelling, not the namespace it resolves to. For React types, replace `JSX.Element` with `React.JSX.Element` and add `import type React from 'react'` if needed. Review locally defined or imported JSX namespaces separately, and run type checking after making changes.

If your repository already configures `@typescript-eslint/no-restricted-types`, preserve those restrictions when adding this one. ESLint replaces the rule's options rather than merging them.

## Migrating from a legacy `.eslintrc`

The `base` preset is intentionally a near-zero-diff port of `openmrs-esm-core`'s `.eslintrc`, so adopting it in an existing repo should not introduce new lint failures. To migrate:

1. Bump `eslint` to match this package's declared peer range (currently `^9.39.0`) and remove the per-plugin ESLint dev dependencies that this package now provides (`@typescript-eslint/*`, `eslint-plugin-import`, `eslint-plugin-react-hooks`, `eslint-plugin-jest-dom`, `eslint-plugin-testing-library`, `eslint-plugin-playwright`, `eslint-config-prettier`).
2. Delete `.eslintrc` / `.eslintignore` and add an `eslint.config.js` as shown above (flat config moves ignores into the config itself).
3. Run your repo's usual source-scoped lint task (for example `yarn turbo run lint`, or the package's `eslint src` script) and confirm it passes. If you want autofixes, run that same source-scoped command with `--fix` and review the diff. Avoid a blanket `eslint . --fix`: it lints and mutates a broader file set than your CI actually checks.
4. Flat config lints `.js`/`.mjs`/`.cjs` files that a legacy `--ext ts,tsx` lint script skipped, so expect findings in `.js` files that were previously unlinted.

A couple of intentional differences from core's legacy config are documented inline in `configs/base.js`, most importantly the [typescript-eslint v8 rule renames](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8/) (`ban-types` was split into three rules) and the added browser globals.

## Versioning policy

This package follows [semantic versioning](https://semver.org/), with one project-specific rule:

- **Any change that can make a previously-passing repo fail is breaking and ships in a major.** That includes adding a rule to a default preset at *any* severity: many O3 repos lint with `--max-warnings 0`, so a new `warn` fails their CI exactly like an `error` would.
- **Minor releases** may add opt-in presets (rules a repo gets only by importing them) and lenient-direction changes (turning a rule off, relaxing rule options).
- **Dependency bumps**: a bump that changes emitted findings is breaking; one verified not to change findings is a patch or minor.

The intended tightening path is: ship candidate rules in an opt-in preset in a minor, let repos adopt and clean up individually, then promote them into the default presets in a later major. When in doubt, treat a change as breaking. The goal is that any non-major upgrade is safe to take without a red build.

## Releasing

Releases are published to npm by CI. To cut a release:

1. Bump `version` in `package.json` on `main` (via a PR).
2. Create a [GitHub release](https://github.com/openmrs/openmrs-contrib-eslint-config/releases/new) with a `v<version>` tag matching the new version (for example `v0.1.0`).

The release workflow verifies the tag matches `package.json`, runs the smoke test, and publishes with npm provenance. There are no pre-releases; every publish is a tagged release.

## Contributing

Issues and pull requests are welcome. Please open an issue to discuss any rule change before sending a PR, since rule changes affect every consuming repository.

## License

[MPL-2.0](./LICENSE)
