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

test('les secrets d’exploration sont uniques et séparés des objectifs principaux', () => {
  const session = new GameSession();
  assert.equal(session.discoverSecret('level-01', 'origin-scroll'), true);
  assert.equal(session.discoverSecret('level-01', 'origin-scroll'), false);
  assert.equal(session.hasDiscoveredSecret('level-01', 'origin-scroll'), true);
  assert.equal(session.hasCollected('level-01', 'origin-scroll'), false);
});

test('un consommable donne son XP puis ne peut pas être utilisé deux fois', () => {
  const session = new GameSession();
  session.inventory.add('xp-tonic');
  assert.equal(session.useItem('xp-tonic'), 5);
  assert.equal(session.xp.value, 5);
  assert.equal(session.useItem('xp-tonic'), 0);
  assert.equal(session.xp.value, 5);
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
