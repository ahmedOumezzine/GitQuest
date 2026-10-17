import test from 'node:test';
import assert from 'node:assert/strict';
import { LevelManager, TiledMapAdapter } from '../src/managers/LevelManager';

test('TiledMapAdapter transforme la couche colliders en rectangles', () => {
  const map = TiledMapAdapter.fromJson({
    width: 30,
    height: 17,
    tilewidth: 32,
    tileheight: 32,
    layers: [{ name: 'colliders', type: 'objectgroup', objects: [{ id: 1, name: 'wall', type: 'wall', x: 64, y: 96, width: 32, height: 64 }] }],
  });
  assert.deepEqual(map.colliders, [{ x: 64, y: 96, width: 32, height: 64 }]);
});

test('la plage conserve ses couches Tiled et ses spawns hors de l’eau', async () => {
  const map = JSON.parse(await (await import('node:fs/promises')).readFile('public/data/maps/level-01.json', 'utf8')) as { width: number; height: number; layers: Array<{ name: string; data?: number[]; objects?: Array<{ type: string }> }> };
  const level = JSON.parse(await (await import('node:fs/promises')).readFile('public/data/levels/level-01.json', 'utf8')) as { playerSpawn: { x: number; y: number }; mentor: { x: number; y: number } };
  const data = TiledMapAdapter.fromJson({ ...map, tilewidth: 32, tileheight: 32 } as never);
  const tileAt = (point: { x: number; y: number }) => data.ground[Math.floor(point.y / data.tileHeight) * data.width + Math.floor(point.x / data.tileWidth)];
  assert.equal(data.ground.length, map.width * map.height);
  assert.ok(data.decorations.some((item) => item.type === 'shrine'));
  assert.ok(data.colliders.length >= 4);
  assert.notEqual(tileAt(level.playerSpawn), 3);
  assert.notEqual(tileAt(level.mentor), 3);
  assert.ok(data.ground.includes(3));
});

test('LevelManager charge un niveau via un fetch injecté', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    id: 'level-07', order: 7, title: { fr: 'Nouveau niveau' }, map: { path: '/map.json' },
    theme: { sky: '#000', ground: '#111', accent: '#fff' }, playerSpawn: { x: 1, y: 1 }, mentor: { x: 2, y: 2 },
    objects: [], dialogues: [], quest: { id: 'q7', title: { fr: 'Q7' }, steps: [{ id: 'exit', kind: 'open-exit' }] },
    gitCommands: [], key: { itemId: 'key', objectId: 'chest' }, exit: { position: { x: 3, y: 3 }, requiredItemId: 'key' },
  }));
  const manager = new LevelManager('/index.json', fetcher);
  const level = await manager.loadDefinition('/level-07.json');
  assert.equal(level.id, 'level-07');
});

test('LevelManager conserve le contexte global de fetch', async () => {
  const fetcher = function (this: typeof globalThis): Promise<Response> {
    assert.equal(this, globalThis);
    return Promise.resolve(new Response(JSON.stringify({ levels: [] })));
  } as typeof fetch;
  const manager = new LevelManager('/index.json', fetcher);
  const levels = await manager.loadAll();
  assert.deepEqual(levels, []);
});
