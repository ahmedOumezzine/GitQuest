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

test('SaveManager ignore une sauvegarde corrompue sans supprimer la donnée brute', () => {
  const values = new Map<string, string>([[SAVE_KEY, '{not-json']]);
  const storage = { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key) } as unknown as Storage;
  const manager = new SaveManager(storage);
  assert.equal(manager.load(), null);
  assert.equal(manager.lastError?.kind, 'corrupt');
  assert.equal(values.get(SAVE_KEY), '{not-json');
});

test('SaveManager absorbe une erreur de quota à l’écriture', () => {
  const storage = { setItem: () => { throw new Error('quota'); }, getItem: () => null, removeItem: () => undefined } as unknown as Storage;
  const manager = new SaveManager(storage);
  const git = new GitSimulator();
  assert.equal(manager.save({ levelId: 'level-01', locale: 'fr', inventory: { items: [] }, xp: { total: 0 }, quests: {}, collectedObjects: {}, git: git.toJSON() }), false);
  assert.equal(manager.lastError?.kind, 'write');
});

test('SaveManager migre une sauvegarde historique vers la version courante', () => {
  const values = new Map<string, string>([[SAVE_KEY, JSON.stringify({
    version: 0,
    levelId: 'level-03',
    locale: 'en',
    inventory: { items: ['pass-key'] },
    xp: { total: 120 },
    quests: {},
    collectedObjects: {},
  })]]);
  const storage = { setItem: (key: string, value: string) => values.set(key, value), getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key) } as unknown as Storage;
  const manager = new SaveManager(storage);
  const loaded = manager.load();
  assert.equal(loaded?.version, 1);
  assert.equal(loaded?.levelId, 'level-03');
  assert.equal(loaded?.locale, 'en');
  assert.deepEqual(loaded?.inventory.items, ['pass-key']);
  assert.equal(loaded?.git.initialized, false);
});
