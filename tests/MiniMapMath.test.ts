import test from 'node:test';
import assert from 'node:assert/strict';
import { minimapGroundColor, minimapPoint } from '../src/ui/hud/MiniMapMath';

test('la mini-carte projette les coordonnées du monde dans sa surface', () => {
  assert.deepEqual(minimapPoint({ x: 0, y: 0 }, 10, 5, 32, 32, 100, 50), { x: 0, y: 0 });
  assert.deepEqual(minimapPoint({ x: 160, y: 80 }, 10, 5, 32, 32, 100, 50), { x: 50, y: 25 });
  assert.deepEqual(minimapPoint({ x: 320, y: 160 }, 10, 5, 32, 32, 100, 50), { x: 100, y: 50 });
});

test('la mini-carte garde une couleur reconnaissable pour eau et terrain', () => {
  assert.notEqual(minimapGroundColor(3), minimapGroundColor(1));
  assert.equal(minimapGroundColor(0), 0x18233e);
});
