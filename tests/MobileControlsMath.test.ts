import test from 'node:test';
import assert from 'node:assert/strict';
import { clampJoystickOffset, joystickVectorFromOffset } from '../src/phaser/MobileControlsMath';

test('le joystick applique une zone morte', () => {
  assert.deepEqual(joystickVectorFromOffset({ x: 5, y: 4 }, 52, 12), { x: 0, y: 0 });
});

test('le joystick normalise les diagonales sans dépasser une longueur de un', () => {
  const vector = joystickVectorFromOffset({ x: 80, y: 80 }, 52, 8);
  assert.ok(Math.abs(Math.hypot(vector.x, vector.y) - 1) < 0.0001);
  assert.ok(Math.abs(vector.x - vector.y) < 0.0001);
});

test('le joystick conserve une intensité analogique intermédiaire', () => {
  const vector = joystickVectorFromOffset({ x: 26, y: 0 }, 52, 8);
  assert.ok(Math.abs(vector.x - 0.5) < 0.0001);
  assert.equal(vector.y, 0);
});

test('le bouton visuel reste dans le cercle', () => {
  const offset = clampJoystickOffset({ x: 100, y: 0 }, 52);
  assert.deepEqual(offset, { x: 52, y: 0 });
});
