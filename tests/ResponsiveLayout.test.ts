import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLayout } from '../src/ui/layout/ResponsiveLayoutManager';

test('le layout identifie correctement les modes desktop, compact et portrait', () => {
  const desktop = calculateLayout(1920, 1080);
  assert.equal(desktop.compact, false);
  assert.equal(desktop.portrait, false);
  assert.equal(desktop.topBarHeight, 64);

  const phoneLandscape = calculateLayout(844, 390);
  assert.equal(phoneLandscape.compact, true);
  assert.equal(phoneLandscape.portrait, false);
  assert.equal(phoneLandscape.topBarHeight, 88);

  const phonePortrait = calculateLayout(390, 844);
  assert.equal(phonePortrait.compact, true);
  assert.equal(phonePortrait.portrait, true);
  assert.equal(phonePortrait.topBarHeight, 118);
});

test('les marges et zones sûres restent dans le viewport', () => {
  const metrics = calculateLayout(390, 844);
  assert.equal(metrics.safe.left, 12);
  assert.equal(metrics.safe.right, 12);
  assert.ok(metrics.topBarHeight < metrics.height);
});
