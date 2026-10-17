import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { GitOperation, LevelDefinition } from '../src/models/game';
import { GameSession } from '../src/core/GameSession';

const levelPaths = Array.from({ length: 6 }, (_, index) => `public/data/levels/level-0${index + 1}.json`);

function prepareGit(session: GameSession, operation: GitOperation) {
  if (operation === 'init') return session.git.execute('git init');
  if (!session.git.initialized) session.git.execute('git init');
  if (operation === 'add') return session.git.execute('git add .');
  if (operation === 'pull') return session.git.execute('git pull');
  if (operation === 'commit') {
    if (!session.git.staged.length) session.git.execute('git add .');
    return session.git.execute('git commit -m "archive"');
  }
  if (!session.git.staged.length && !session.git.commits.length) {
    session.git.execute('git add .');
    session.git.execute('git commit -m "archive"');
  }
  if (operation === 'push') return session.git.execute('git push');
  if (operation === 'branch') return session.git.execute('git branch feature');
  if (operation === 'switch') return session.git.execute('git switch feature');
  if (operation === 'merge') {
    session.git.execute('git branch feature');
    return session.git.execute('git merge feature');
  }
  throw new Error(`Opération de test non préparée : ${operation}`);
}

test('les six niveaux suivent le même parcours data-driven sans doubler la récompense', async () => {
  for (const path of levelPaths) {
    const level = JSON.parse(await readFile(path, 'utf8')) as LevelDefinition;
    const session = new GameSession();
    const quest = session.createQuest(level);
    const dialogue = level.quest.steps[0].dialogueId!;

    assert.equal(quest.acceptDialogue(dialogue), true, level.id);
    for (const step of level.quest.steps.filter((item) => item.kind === 'git-command')) {
      const operation = step.operation!;
      const gitResult = prepareGit(session, operation);
      assert.equal(quest.acceptGit(gitResult, operation), true, `${level.id}:${step.id}`);
    }

    assert.equal(session.inventory.add(level.key.itemId), true, level.id);
    assert.equal(quest.acceptCollection(level.key.objectId), true, level.id);
    assert.equal(session.inventory.add(level.key.itemId), false, level.id);
    assert.equal(quest.acceptCollection(level.key.objectId), false, level.id);
    assert.equal(quest.acceptExit(), true, level.id);
    assert.equal(quest.acceptExit(), false, level.id);
    assert.equal(quest.isComplete, true, level.id);
  }
});
