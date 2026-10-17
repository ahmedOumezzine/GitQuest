import test from 'node:test';
import assert from 'node:assert/strict';
import { RuntimeMetrics } from '../src/diagnostics/RuntimeMetrics';
import { resolveQaLevelId } from '../src/diagnostics/QaRoute';

test('RuntimeMetrics produit une mesure FPS après une seconde d’échantillonnage', () => {
  const metrics = new RuntimeMetrics();
  metrics.frame(0);
  for (let frame = 1; frame <= 60; frame += 1) metrics.frame(frame * (1000 / 60));
  const snapshot = metrics.snapshot();
  assert.ok(snapshot.fps > 59 && snapshot.fps < 61);
  assert.ok(snapshot.frameTimeMs > 16 && snapshot.frameTimeMs < 17);
  assert.equal(snapshot.sampleFrames, 60);
});

test('la route QA ne sélectionne qu’un niveau présent dans le manifest', () => {
  const levels = ['level-01', 'level-02', 'level-06'];
  assert.equal(resolveQaLevelId('?qaLevel=level-02', levels), 'level-02');
  assert.equal(resolveQaLevelId('?qaLevel=level-07', levels), undefined);
  assert.equal(resolveQaLevelId('', levels), undefined);
});
