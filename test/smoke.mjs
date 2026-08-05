import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import openmrs from '../index.js';

/**
 * Smoke test: the composed config loads under ESLint 9 (every plugin
 * resolves), clean code lints without errors, and a representative rule
 * from each preset actually fires.
 */
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: openmrs });

async function lint(code, filePath) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

function ruleIds(messages) {
  return messages.map((m) => m.ruleId);
}

// Clean TypeScript passes.
{
  const messages = await lint(
    `import { type ReactNode } from 'react';\n\nexport function noop(): ReactNode {\n  return null;\n}\n`,
    'src/clean.tsx',
  );
  assert.deepEqual(messages, [], `expected no messages, got: ${JSON.stringify(messages, null, 2)}`);
}

// Base preset: no-console and the lodash import guard fire.
{
  const messages = await lint(
    `import _ from 'lodash';\n\nconsole.log(_.map([1], (x) => x));\n`,
    'src/dirty.ts',
  );
  const ids = ruleIds(messages);
  assert.ok(ids.includes('no-restricted-imports'), `expected no-restricted-imports, got: ${ids}`);
  assert.ok(ids.includes('no-console'), `expected no-console, got: ${ids}`);
}

// React preset: rules-of-hooks fires.
{
  const messages = await lint(
    `import { useState } from 'react';\n\nexport function notAComponent() {\n  const [x] = useState(0);\n  return x;\n}\n`,
    'src/hooks.tsx',
  );
  const ids = ruleIds(messages);
  assert.ok(ids.includes('react-hooks/rules-of-hooks'), `expected react-hooks/rules-of-hooks, got: ${ids}`);
}

// Test preset: testing-library rules apply to *.test.tsx.
{
  const messages = await lint(
    `import { render } from '@testing-library/react';\n\ntest('renders', () => {\n  const { container } = render(null);\n  container.querySelector('.foo');\n});\n`,
    'src/example.test.tsx',
  );
  const ids = ruleIds(messages);
  assert.ok(
    ids.some((id) => id?.startsWith('testing-library/')),
    `expected a testing-library rule, got: ${ids}`,
  );
}

// E2E preset: playwright rules apply to e2e specs.
{
  const messages = await lint(
    `import { test } from '@playwright/test';\n\ntest('loads', async ({ page }) => {\n  await page.waitForTimeout(1000);\n});\n`,
    'e2e/specs/example.spec.ts',
  );
  const ids = ruleIds(messages);
  assert.ok(
    ids.some((id) => id?.startsWith('playwright/')),
    `expected a playwright rule, got: ${ids}`,
  );
}

// Base preset: the Carbon import guards fire.
{
  const messages = await lint(
    `import { Toggle } from 'carbon-components-react';\nimport { ChevronUp } from '@carbon/icons-react';\n\nexport { Toggle, ChevronUp };\n`,
    'src/carbon.ts',
  );
  const ids = ruleIds(messages).filter((id) => id === 'no-restricted-imports');
  assert.equal(ids.length, 2, `expected two no-restricted-imports errors, got: ${JSON.stringify(messages)}`);
}

// Contract: require() is rejected in source files (TS and JS alike). The
// toolsmith path guards against the tools/ glob matching by substring.
for (const filePath of ['src/uses-require.ts', 'src/uses-require.js', 'src/toolsmith/uses-require.js']) {
  const messages = await lint(`const fs = require('fs');\n\nfs.readFileSync('x');\n`, filePath);
  assert.ok(
    ruleIds(messages).includes('@typescript-eslint/no-require-imports'),
    `expected no-require-imports in ${filePath}, got: ${JSON.stringify(messages)}`,
  );
}

// Contract: require() is allowed in CommonJS tooling and config files. The
// root-level tools/ and setup-tests.js paths pin the zero-prefix semantics of
// the `**/` globs, which is what lets one pattern cover both root and nested
// locations.
for (const filePath of [
  'webpack.config.js',
  'jest.config.js',
  'i18next-parser-config.js',
  'karma.conf.js',
  'tools/helper.js',
  'tools/i18next-parser.config.js',
  'packages/app/tools/helper.js',
  'setup-tests.js',
  'src/setup-tests.js',
  '__mocks__/react-i18next.js',
  'scripts/build.cjs',
]) {
  const messages = await lint(`const fs = require('fs');\n\nfs.readFileSync('x');\n`, filePath);
  assert.ok(
    !ruleIds(messages).includes('@typescript-eslint/no-require-imports'),
    `expected no no-require-imports in ${filePath}, got: ${JSON.stringify(messages)}`,
  );
}

// Contract: test-scoped rules do not leak into non-test source files.
{
  const messages = await lint(
    `import { render } from '@testing-library/react';\n\nexport function helper() {\n  const { container } = render(null);\n  return container.querySelector('.foo');\n}\n`,
    'src/not-a-test.tsx',
  );
  const ids = ruleIds(messages);
  assert.ok(
    !ids.some((id) => id?.startsWith('testing-library/') || id?.startsWith('jest-dom/')),
    `expected no test-preset rules outside test files, got: ${ids}`,
  );
}

// Contract: playwright rules do not leak outside e2e specs.
{
  const messages = await lint(
    `import { test } from '@playwright/test';\n\ntest('loads', async ({ page }) => {\n  await page.waitForTimeout(1000);\n});\n`,
    'src/example.test.ts',
  );
  const ids = ruleIds(messages);
  assert.ok(
    !ids.some((id) => id?.startsWith('playwright/')),
    `expected no playwright rules outside e2e/, got: ${ids}`,
  );
}

// Contract: the composed default applies eslint-config-prettier last.
{
  const { default: composed } = await import('../index.js');
  const { default: prettier } = await import('eslint-config-prettier');
  assert.equal(composed[composed.length - 1], prettier, 'expected prettier to be the last entry of the composed config');
}

console.log('Contract tests passed: presets compose, scope, and enforce as documented.');
