import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import openmrs, { modals } from '@openmrs/eslint-config';
import modalSubpath from '@openmrs/eslint-config/modals';

assert.equal(modals, modalSubpath, 'the named and subpath exports should expose the same preset');

const defaults = new ESLint({ overrideConfigFile: true, overrideConfig: openmrs });
const optedIn = new ESLint({ overrideConfigFile: true, overrideConfig: [...openmrs, ...modals] });

async function restrictedImports(eslint, code) {
  const [result] = await eslint.lintText(code, { filePath: 'src/modal.tsx' });
  assert.ok(!result.messages.some((message) => message.fatal), JSON.stringify(result.messages));
  return result.messages.filter((message) => message.ruleId === 'no-restricted-imports');
}

for (const code of [
  "import { Modal } from '@carbon/react';",
  "import { Modal as Dialog } from '@carbon/react';",
  "import { ComposedModal } from '@carbon/react';",
  "export { Modal as Dialog } from '@carbon/react';",
  "export * from '@carbon/react';",
  // Namespace imports are intentionally restricted even if only another component is used.
  "import * as Carbon from '@carbon/react'; Carbon.Button;",
  "import * as Carbon from '@carbon/react'; Carbon.Modal;",
  "import Modal from '@carbon/react/es/components/Modal';",
  "import Modal from '@carbon/react/lib/components/Modal/index.js';",
  "import Modal from '@carbon/react/es/components/Modal/Modal.js';",
  "import ComposedModal from '@carbon/react/lib/components/ComposedModal';",
  "import ComposedModal from '@carbon/react/es/components/ComposedModal/ComposedModal.js';",
  "export { default as Dialog } from '@carbon/react/lib/components/Modal';",
]) {
  assert.equal((await restrictedImports(defaults, code)).length, 0, `defaults must still allow: ${code}`);
  const messages = await restrictedImports(optedIn, code);
  assert.ok(messages.length > 0, `expected a modal restriction for: ${code}`);
  assert.ok(messages.every((message) => message.severity === 2));
  assert.ok(messages.every((message) => message.message.includes('https://o3-docs.openmrs.org/en-US/docs/modal-system/')));
}

for (const code of [
  "import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';",
  "import type { ModalProps, ComposedModalProps } from '@carbon/react';",
  "import type { Modal } from '@carbon/react';",
  "import { type Modal, Button } from '@carbon/react';",
  "export type { Modal } from '@carbon/react';",
  "import type Modal from '@carbon/react/es/components/Modal';",
  "import { ModalBody } from '@carbon/react/es/components/ComposedModal';",
  "import ModalBody from '@carbon/react/es/components/ModalBody/ModalBody.js';",
  "import { Modal } from './local-modal';",
  "import { showModal } from '@openmrs/esm-framework';",
  // Static import restrictions do not inspect dynamic imports or CommonJS calls.
  "const { Modal } = await import('@carbon/react');",
  "const { Modal } = require('@carbon/react');",
]) {
  assert.equal((await restrictedImports(optedIn, code)).length, 0, `expected no import restriction for: ${code}`);
}

for (const code of [
  "import _ from 'lodash';",
  "import _ from 'lodash-es';",
  "import { Button } from 'carbon-components-react';",
  "import { Add } from '@carbon/icons-react';",
]) {
  assert.equal((await restrictedImports(optedIn, code)).length, 1, `existing restriction lost for: ${code}`);
}

const documentedException = `import {
  // eslint-disable-next-line no-restricted-imports -- Legacy workspace infrastructure owns this modal's lifecycle.
  ComposedModal,
  ModalBody,
} from '@carbon/react';`;
assert.equal((await restrictedImports(optedIn, documentedException)).length, 0);

console.log('Modal tests passed: opt-in restrictions, allowed imports, exceptions, and existing guards.');
