import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import openmrs, { reactTypes } from '@openmrs/eslint-config';
import subpath from '@openmrs/eslint-config/react-types';

assert.equal(reactTypes, subpath, 'named and subpath exports must provide the same preset');

const ruleId = '@typescript-eslint/no-restricted-types';
const before = "import type React from 'react';\n\nexport type Element = JSX.Element;\n";
const after = before.replace('JSX.Element', 'React.JSX.Element');

for (const config of [reactTypes, [...openmrs, ...reactTypes]]) {
  const options = { overrideConfigFile: true, overrideConfig: config };
  const eslint = new ESLint(options);

  for (const filePath of ['src/element.ts', 'src/element.tsx', 'src/element.mts', 'src/element.cts']) {
    const [rejected] = await eslint.lintText(before, { filePath });
    assert.equal(rejected.fatalErrorCount, 0);
    assert.equal(rejected.messages.length, 1);
    assert.equal(rejected.messages[0].ruleId, ruleId);
    assert.equal(rejected.messages[0].severity, 2);
    assert.equal(rejected.messages[0].fix, undefined);

    const [accepted] = await eslint.lintText(after, { filePath });
    assert.deepEqual(accepted.messages, []);

    const [fixed] = await new ESLint({ ...options, fix: true }).lintText(before, { filePath });
    assert.equal(fixed.output, undefined);
    assert.equal(fixed.messages[0].ruleId, ruleId);
  }

  for (const code of [
    "import type React from 'react';\nexport type Child = React.ReactNode;\n",
    "import { createElement } from 'react';\nexport const element = createElement('div');\n",
    'export function Example() { return <div />; }\n',
    'export const JSX = { Element: 1 };\nexport const value = JSX.Element;\n',
  ]) {
    const [result] = await eslint.lintText(code, { filePath: 'src/allowed.tsx' });
    assert.deepEqual(result.messages, []);
  }
}

// The rule matches spelling, not namespace identity. Never rewrite a bound JSX type.
{
  const code = `export namespace JSX { export type Element = string; }
export namespace React { export namespace JSX { export type Element = number; } }
export const element: JSX.Element = 'valid';
`;
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: reactTypes, fix: true });
  const [result] = await eslint.lintText(code, { filePath: 'src/local.ts' });
  assert.equal(result.output, undefined);
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].ruleId, ruleId);
  assert.equal(result.messages[0].fix, undefined);
}

// Installing the package without opting in must not introduce the restriction.
const defaults = new ESLint({ overrideConfigFile: true, overrideConfig: openmrs });
const [unchanged] = await defaults.lintText(before, { filePath: 'src/element.tsx' });
assert.deepEqual(unchanged.messages, []);

// The preset does not change JavaScript linting.
const composed = new ESLint({ overrideConfigFile: true, overrideConfig: [...openmrs, ...reactTypes] });
const jsConfig = await composed.calculateConfigForFile('src/element.js');
assert.equal(jsConfig.rules[ruleId], undefined);

console.log('React type tests passed: opt-in scope, exports, diagnostics, and no automatic rewrites.');
