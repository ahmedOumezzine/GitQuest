import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GameSession } from '../src/core/GameSession';
import type { LevelDefinition } from '../src/models/game';

test('les objets collectés sont idempotents et persistables', () => {
  const session = new GameSession();
  session.collectObject('level-01', 'memory-crystal');
  session.collectObject('level-01', 'memory-crystal');
  assert.equal(session.hasCollected('level-01', 'memory-crystal'), true);
  assert.deepEqual(session.collectedObjects['level-01'], ['memory-crystal']);
});

test('les commandes tactiles sont désactivées par défaut et forçables depuis les paramètres', () => {
  const session = new GameSession();
  assert.equal(session.shouldShowTouchControls(), false);
  session.touchControlsMode = 'always';
  assert.equal(session.shouldShowTouchControls(), true);
});

test('une nouvelle partie retrouve l’objectif Parler à Midou', async () => {
  const level = JSON.parse(await readFile('public/data/levels/level-01.json', 'utf8')) as LevelDefinition;
  const session = new GameSession();
  const quest = session.createQuest(level);
  quest.acceptDialogue('midou-01');
  session.collectObject('level-01', 'memory-crystal');
  session.reset();
  const resetQuest = session.createQuest(level);
  assert.equal(resetQuest.currentStep?.id, 'talk-midou');
  assert.equal(session.hasCollected('level-01', 'memory-crystal'), false);
  assert.equal(session.xp.value, 0);
});
