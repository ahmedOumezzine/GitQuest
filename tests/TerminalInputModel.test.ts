import assert from 'node:assert/strict';
import test from 'node:test';
import { TerminalInputModel } from '../src/systems/TerminalInputModel';

test('TerminalInputModel garde les dernières commandes et conserve les espaces', () => {
  const input = new TerminalInputModel();
  input.setValue('git commit -m "archive finale"');
  input.remember(input.value);
  input.clear();
  input.setValue('git status');
  input.remember(input.value);
  input.clear();

  assert.equal(input.moveHistory(-1), 'git status');
  assert.equal(input.moveHistory(-1), 'git commit -m "archive finale"');
  assert.equal(input.moveHistory(1), 'git status');
});
