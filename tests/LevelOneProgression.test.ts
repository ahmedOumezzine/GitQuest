import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { LevelDefinition } from '../src/models/game';
import { GameSession } from '../src/core/GameSession';

test('le niveau 1 progresse de Midou à la porte sans doubler les récompenses', async () => {
  const level = JSON.parse(await readFile('public/data/levels/level-01.json', 'utf8')) as LevelDefinition;
  const session = new GameSession();
  const quest = session.createQuest(level);

  assert.equal(quest.currentStep?.id, 'talk-midou');
  assert.equal(quest.acceptDialogue('midou-01'), true);
  assert.equal(quest.currentStep?.id, 'run-init');

  const init = session.git.execute('git init');
  assert.equal(quest.acceptGit(init, 'init'), true);
  assert.equal(quest.currentStep?.id, 'collect-key');
  assert.equal(quest.acceptExit(), false);

  assert.equal(session.inventory.add(level.key.itemId), true);
  assert.equal(quest.acceptCollection(level.key.objectId), true);
  assert.equal(session.inventory.add(level.key.itemId), false);
  assert.equal(quest.acceptCollection(level.key.objectId), false);
  assert.deepEqual(session.inventory.list(), ['pass-key']);

  session.xp.add(50);
  const xpAfterReward = session.xp.value;
  session.xp.add(0);
  assert.equal(session.xp.value, xpAfterReward);

  assert.equal(quest.currentStep?.id, 'open-exit');
  assert.equal(quest.acceptExit(), true);
  assert.equal(quest.acceptExit(), false);
  assert.equal(quest.isComplete, true);
});
