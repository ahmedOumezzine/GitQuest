import test from 'node:test';
import assert from 'node:assert/strict';
import { interactionKeyEvents, terminalKeyEvent } from '../src/phaser/InputBindings';

test('les contrôles clavier documentés couvrent E, Entrée et T', () => {
  assert.deepEqual(interactionKeyEvents, ['keydown-E', 'keydown-ENTER']);
  assert.equal(terminalKeyEvent, 'keydown-T');
});
