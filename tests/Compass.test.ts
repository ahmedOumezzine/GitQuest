import test from 'node:test';
import assert from 'node:assert/strict';
import { directionArrow } from '../src/ui/hud/CompassMath';

test('la boussole fournit une direction stable vers la cible', () => {
  assert.equal(directionArrow({ x: 0, y: 0 }, { x: 10, y: 0 }), '→');
  assert.equal(directionArrow({ x: 0, y: 0 }, { x: 0, y: 10 }), '↓');
  assert.equal(directionArrow({ x: 0, y: 0 }, { x: -10, y: -10 }), '↖');
});
