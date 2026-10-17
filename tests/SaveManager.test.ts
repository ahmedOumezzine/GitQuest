import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY, SaveManager } from '../src/managers/SaveManager';
import { GitSimulator } from '../src/systems/GitSimulator';

test('SaveManager versionne et recharge la progression', () => {
  const values = new Map<string, string>();
  const storage = { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key) } as unknown as Storage;
  const manager = new SaveManager(storage);
  const git = new GitSimulator();
  manager.save({ levelId: 'level-02', locale: 'fr', inventory: { items: ['pass-key'] }, xp: { total: 50 }, quests: {}, collectedObjects: {}, git: git.toJSON() });
  const loaded = manager.load();
  assert.equal(values.has(SAVE_KEY), true);
  assert.equal(loaded?.version, 1);
  assert.equal(loaded?.levelId, 'level-02');
});
