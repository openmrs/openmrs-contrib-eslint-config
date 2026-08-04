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

console.log('Smoke test passed: config loads and all five presets enforce their rules.');
