import test from 'node:test';
import assert from 'node:assert/strict';
import { QuestManager } from '../src/managers/QuestManager';
import type { QuestDefinition } from '../src/models/game';

const definition: QuestDefinition = {
  id: 'test-quest',
  title: { fr: 'Test' },
  steps: [
    { id: 'talk', kind: 'dialogue', dialogueId: 'midou' },
    { id: 'init', kind: 'git-command', operation: 'init' },
    { id: 'key', kind: 'collect', objectId: 'chest', itemId: 'pass-key' },
    { id: 'exit', kind: 'open-exit' },
  ],
};

test('QuestManager applique les étapes dans l’ordre', () => {
  const quest = new QuestManager(definition);
  assert.equal(quest.acceptGit({ ok: true, operation: 'init', message: '', stateChanged: true }, 'init'), false);
  assert.equal(quest.acceptDialogue('midou'), true);
  assert.equal(quest.acceptGit({ ok: true, operation: 'init', message: '', stateChanged: true }, 'init'), true);
  assert.equal(quest.acceptCollection('chest'), true);
  assert.equal(quest.acceptExit(), true);
  assert.equal(quest.isComplete, true);
});

test('une commande refusée ne valide pas la quête', () => {
  const quest = new QuestManager(definition);
  quest.acceptDialogue('midou');
  assert.equal(quest.acceptGit({ ok: false, operation: 'init', message: 'erreur', stateChanged: false }, 'init'), false);
  assert.equal(quest.currentStep?.id, 'init');
});
