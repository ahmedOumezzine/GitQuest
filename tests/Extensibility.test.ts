import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../src/core/GameSession';
import { LevelManager } from '../src/managers/LevelManager';
import type { LevelDefinition, TiledMapJson } from '../src/models/game';

const levelSeven: LevelDefinition = {
  id: 'level-07', order: 7, title: { fr: 'Archives du Vent' }, map: { path: '/data/maps/level-07.json' },
  theme: { sky: '#20334d', ground: '#587a88', accent: '#f7d56a' }, playerSpawn: { x: 32, y: 32 }, mentor: { x: 64, y: 32 },
  objects: [{ id: 'level7-chest', kind: 'chest', position: { x: 96, y: 32 }, itemId: 'pass-key' }], dialogues: [{ id: 'level7-midou', speaker: 'Midou', text: { fr: 'Une nouvelle archive.' } }],
  quest: { id: 'quest-07', title: { fr: 'Tester l’extension' }, steps: [{ id: 'talk', kind: 'dialogue', dialogueId: 'level7-midou' }, { id: 'init', kind: 'git-command', operation: 'init' }, { id: 'key', kind: 'collect', objectId: 'level7-chest', itemId: 'pass-key' }, { id: 'exit', kind: 'open-exit' }] },
  gitCommands: ['init'], key: { itemId: 'pass-key', objectId: 'level7-chest' }, exit: { position: { x: 128, y: 32 }, requiredItemId: 'pass-key' },
};

const levelSevenMap: TiledMapJson = {
  width: 4, height: 2, tilewidth: 32, tileheight: 32,
  layers: [
    { name: 'Ground', type: 'tilelayer', data: [1, 1, 1, 1, 1, 1, 1, 1] },
    { name: 'Decorations', type: 'objectgroup', objects: [] },
    { name: 'Collisions', type: 'objectgroup', objects: [] },
    { name: 'Objects', type: 'objectgroup', objects: [
      { id: 1, name: 'player-spawn', type: 'spawn', x: 32, y: 32, width: 0, height: 0 },
      { id: 2, name: 'midou', type: 'npc', x: 64, y: 32, width: 0, height: 0 },
      { id: 3, name: 'level7-chest', type: 'chest', x: 96, y: 32, width: 0, height: 0 },
      { id: 4, name: 'exit-gate', type: 'door', x: 128, y: 32, width: 0, height: 0 },
    ] },
  ],
};

test('un niveau 7 peut être ajouté par données avec les mécaniques existantes', async () => {
  const fetcher: typeof fetch = async (path) => {
    const pathText = typeof path === 'string' ? path : path instanceof URL ? path.toString() : path.url;
    const payload = pathText.includes('/levels/') ? levelSeven : levelSevenMap;
    return new Response(JSON.stringify(payload));
  };
  const manager = new LevelManager('/index.json', fetcher);
  const loadedLevel = await manager.loadDefinition('/data/levels/level-07.json');
  const loadedMap = await manager.loadMap(loadedLevel);
  assert.equal(loadedMap.objects.length, 4);

  const session = new GameSession();
  const quest = session.createQuest(loadedLevel);
  assert.equal(quest.acceptDialogue('level7-midou'), true);
  assert.equal(quest.acceptGit(session.git.execute('git init'), 'init'), true);
  session.inventory.add('pass-key');
  assert.equal(quest.acceptCollection('level7-chest'), true);
  assert.equal(quest.acceptExit(), true);
  assert.equal(quest.isComplete, true);
});
