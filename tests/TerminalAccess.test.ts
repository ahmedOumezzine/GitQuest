import test from 'node:test';
import assert from 'node:assert/strict';
import { findNearbyTerminal, isTerminalZone, terminalZoneCenter } from '../src/systems/TerminalAccess';

const shrine = { id: 1, name: 'git-shrine', type: 'shrine', x: 520, y: 300, width: 96, height: 96 };

test('recognizes shrine, altar and sanctuary Tiled decorations as terminal zones', () => {
  assert.equal(isTerminalZone(shrine), true);
  assert.equal(isTerminalZone({ type: 'forest-ruin', name: 'ruin-east' }), false);
  assert.equal(isTerminalZone({ type: 'decoration', name: 'archive-terminal' }), true);
});

test('uses the center of a Tiled decoration for terminal proximity', () => {
  assert.deepEqual(terminalZoneCenter(shrine), { x: 568, y: 348 });
  assert.equal(findNearbyTerminal({ x: 568, y: 348 }, [shrine]), shrine);
  assert.equal(findNearbyTerminal({ x: 300, y: 300 }, [shrine]), undefined);
});

test('ignores non-terminal decorations even when they are nearby', () => {
  const ruin = { id: 2, name: 'ruin-east', type: 'ruin-rich', x: 520, y: 300, width: 96, height: 96 };
  assert.equal(findNearbyTerminal({ x: 568, y: 348 }, [ruin]), undefined);
});
