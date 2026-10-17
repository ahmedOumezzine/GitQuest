import test from 'node:test';
import assert from 'node:assert/strict';
import { LevelManager, resolveTiledObjectPoint, TiledMapAdapter } from '../src/managers/LevelManager';

test('TiledMapAdapter transforme la couche colliders en rectangles', () => {
  const map = TiledMapAdapter.fromJson({
    width: 30,
    height: 17,
    tilewidth: 32,
    tileheight: 32,
    layers: [{ name: 'colliders', type: 'objectgroup', objects: [{ id: 1, name: 'wall', type: 'wall', x: 64, y: 96, width: 32, height: 64 }] }],
  });
  assert.deepEqual(map.colliders, [{ x: 64, y: 96, width: 32, height: 64 }]);
  assert.deepEqual(map.objects, []);
});

test('la plage conserve ses couches Tiled et ses spawns hors de l’eau', async () => {
  const map = JSON.parse(await (await import('node:fs/promises')).readFile('public/data/maps/level-01.json', 'utf8')) as { width: number; height: number; layers: Array<{ name: string; data?: number[]; objects?: Array<{ type: string }> }> };
  const level = JSON.parse(await (await import('node:fs/promises')).readFile('public/data/levels/level-01.json', 'utf8')) as { playerSpawn: { x: number; y: number }; mentor: { x: number; y: number } };
  const data = TiledMapAdapter.fromJson({ ...map, tilewidth: 32, tileheight: 32 } as never);
  const tileAt = (point: { x: number; y: number }) => data.ground[Math.floor(point.y / data.tileHeight) * data.width + Math.floor(point.x / data.tileWidth)];
  assert.equal(data.ground.length, map.width * map.height);
  assert.ok(data.decorations.some((item) => item.type === 'shrine'));
  assert.ok(data.colliders.length >= 4);
  assert.equal(data.objects.length, 3);
  assert.notEqual(tileAt(level.playerSpawn), 3);
  assert.notEqual(tileAt(level.mentor), 3);
  assert.ok(data.ground.includes(3));
  data.ground.forEach((tile, index) => {
    if (tile !== 3) return;
    const x = index % data.width;
    const y = Math.floor(index / data.width);
    assert.ok(y <= 2 || y >= data.height - 3 || x <= 4 || x >= data.width - 5, `water shoreline anomaly at ${x},${y}`);
  });
});

test('les six cartes Tiled exposent les couches et objets de progression attendus', async () => {
  const { readFile } = await import('node:fs/promises');
  for (let index = 1; index <= 6; index += 1) {
    const map = JSON.parse(await readFile(`public/data/maps/level-0${index}.json`, 'utf8')) as { layers: Array<{ name: string; objects?: Array<{ name: string; type: string }> }> };
    const names = map.layers.map((layer) => layer.name);
    assert.deepEqual(names.sort(), ['Collisions', 'Decorations', 'Ground', 'Objects'].sort(), `level-0${index}`);
    const objects = map.layers.find((layer) => layer.name === 'Objects')?.objects ?? [];
    assert.ok(objects.some((object) => object.type === 'spawn'), `spawn level-0${index}`);
    assert.ok(objects.some((object) => object.type === 'npc'), `mentor level-0${index}`);
    assert.ok(objects.some((object) => object.type === 'door'), `door level-0${index}`);
  }
});

test('la Forêt des Fichiers possède un terrain Tiled forestier et ses landmarks', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile('public/data/maps/level-02.json', 'utf8')) as {
    width: number;
    height: number;
    tilesets?: Array<{ source: string }>;
    layers: Array<{ name: string; type: string; data?: number[]; objects?: Array<{ name: string; type: string }> }>;
  };
  const ground = map.layers.find((layer) => layer.name === 'Ground');
  const decorations = map.layers.find((layer) => layer.name === 'Decorations')?.objects ?? [];
  assert.equal(ground?.type, 'tilelayer');
  assert.equal(ground?.data?.length, map.width * map.height);
  assert.equal(map.tilesets?.[0]?.source, '../../assets/tilesets/forest-tileset.tsx');
  assert.ok(['forest-tree', 'forest-root', 'forest-shrine', 'forest-canopy'].every((type) => decorations.some((object) => object.type === type)));
});

test('la Grotte des Souvenirs possède un terrain Tiled rocheux et ses repères de commit', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile('public/data/maps/level-03.json', 'utf8')) as {
    width: number;
    height: number;
    tilesets?: Array<{ source: string }>;
    layers: Array<{ name: string; type: string; data?: number[]; objects?: Array<{ name: string; type: string }> }>;
  };
  const ground = map.layers.find((layer) => layer.name === 'Ground');
  const decorations = map.layers.find((layer) => layer.name === 'Decorations')?.objects ?? [];
  assert.equal(ground?.type, 'tilelayer');
  assert.equal(ground?.data?.length, map.width * map.height);
  assert.equal(map.tilesets?.[0]?.source, '../../assets/tilesets/cave-tileset.tsx');
  assert.ok(decorations.some((object) => object.name === 'cave-stalactites'));
  assert.ok(['cave-torch', 'cave-altar'].every((type) => decorations.some((object) => object.type === type)));
});

test('le Port des Connexions possède un terrain Tiled de quai et ses repères push-pull', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile('public/data/maps/level-04.json', 'utf8')) as {
    width: number;
    height: number;
    tilesets?: Array<{ source: string }>;
    layers: Array<{ name: string; type: string; data?: number[]; objects?: Array<{ name: string; type: string }> }>;
  };
  const ground = map.layers.find((layer) => layer.name === 'Ground');
  const decorations = map.layers.find((layer) => layer.name === 'Decorations')?.objects ?? [];
  assert.equal(ground?.type, 'tilelayer');
  assert.equal(ground?.data?.length, map.width * map.height);
  assert.equal(map.tilesets?.[0]?.source, '../../assets/tilesets/harbor-tileset.tsx');
  assert.ok(['harbor-docks', 'harbor-pylons', 'harbor-altar', 'harbor-lighthouse'].every((name) => decorations.some((object) => object.name === name)));
});

test('la Montagne des Branches possède un terrain Tiled de sentier et ses repères branch-switch', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile('public/data/maps/level-05.json', 'utf8')) as {
    width: number;
    height: number;
    tilesets?: Array<{ source: string }>;
    layers: Array<{ name: string; type: string; data?: number[]; objects?: Array<{ name: string; type: string }> }>;
  };
  const ground = map.layers.find((layer) => layer.name === 'Ground');
  const decorations = map.layers.find((layer) => layer.name === 'Decorations')?.objects ?? [];
  assert.equal(ground?.type, 'tilelayer');
  assert.equal(ground?.data?.length, map.width * map.height);
  assert.equal(map.tilesets?.[0]?.source, '../../assets/tilesets/mountain-tileset.tsx');
  assert.ok(['mountain-fork', 'mountain-altar', 'mountain-marker', 'mountain-wind'].every((name) => decorations.some((object) => object.name === name)));
});

test('le Château des Conflits possède un terrain Tiled de cour et ses repères de merge', async () => {
  const { readFile } = await import('node:fs/promises');
  const map = JSON.parse(await readFile('public/data/maps/level-06.json', 'utf8')) as {
    width: number;
    height: number;
    tilesets?: Array<{ source: string }>;
    layers: Array<{ name: string; type: string; data?: number[]; objects?: Array<{ name: string; type: string }> }>;
  };
  const ground = map.layers.find((layer) => layer.name === 'Ground');
  const decorations = map.layers.find((layer) => layer.name === 'Decorations')?.objects ?? [];
  assert.equal(ground?.type, 'tilelayer');
  assert.equal(ground?.data?.length, map.width * map.height);
  assert.equal(map.tilesets?.[0]?.source, '../../assets/tilesets/castle-tileset.tsx');
  assert.ok(['castle-altar', 'castle-rune', 'castle-brazier', 'castle-arch'].every((name) => decorations.some((object) => object.name === name)));
});

test('TiledMapAdapter expose la couche Objects sans la mélanger aux décorations', () => {
  const data = TiledMapAdapter.fromJson({ width: 2, height: 2, tilewidth: 32, tileheight: 32, layers: [
    { name: 'Decorations', type: 'objectgroup', objects: [{ id: 1, name: 'palm', type: 'palm', x: 0, y: 0, width: 32, height: 32 }] },
    { name: 'Objects', type: 'objectgroup', objects: [{ id: 2, name: 'spawn', type: 'spawn', x: 32, y: 32, width: 0, height: 0 }] },
  ] });
  assert.equal(data.decorations[0].type, 'palm');
  assert.equal(data.objects[0].type, 'spawn');
});

test('les ancres Tiled pilotent les six spawns sans modifier les coordonnées métier', async () => {
  const { readFile } = await import('node:fs/promises');
  for (let index = 1; index <= 6; index += 1) {
    const suffix = String(index).padStart(2, '0');
    const map = JSON.parse(await readFile(`public/data/maps/level-${suffix}.json`, 'utf8')) as { layers: Array<{ name: string; objects?: Array<{ id: number; name: string; type: string; x: number; y: number; width: number; height: number }> }> };
    const level = JSON.parse(await readFile(`public/data/levels/level-${suffix}.json`, 'utf8')) as { playerSpawn: { x: number; y: number }; mentor: { x: number; y: number }; exit: { position: { x: number; y: number } } };
    const objects = map.layers.find((layer) => layer.name === 'Objects')?.objects ?? [];
    assert.deepEqual(resolveTiledObjectPoint(objects, 'spawn', 'player-spawn', level.playerSpawn), level.playerSpawn, `player ${suffix}`);
    assert.deepEqual(resolveTiledObjectPoint(objects, 'npc', 'midou', level.mentor), level.mentor, `mentor ${suffix}`);
    assert.deepEqual(resolveTiledObjectPoint(objects, 'door', 'exit-gate', level.exit.position), level.exit.position, `gate ${suffix}`);
  }
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

test('LevelManager refuse une carte Tiled incomplète avec une erreur exploitable', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    width: 2, height: 2, tilewidth: 32, tileheight: 32,
    layers: [{ name: 'Ground', type: 'tilelayer', data: [1, 1, 1, 1] }],
  }));
  const manager = new LevelManager('/index.json', fetcher);
  const level = { id: 'level-07', order: 7, title: { fr: 'Nouveau niveau' }, map: { path: '/map.json' }, theme: { sky: '#000', ground: '#111', accent: '#fff' }, playerSpawn: { x: 1, y: 1 }, mentor: { x: 2, y: 2 }, objects: [], dialogues: [], quest: { id: 'q7', title: { fr: 'Q7' }, steps: [{ id: 'exit', kind: 'open-exit' }] }, gitCommands: [], key: { itemId: 'key', objectId: 'chest' }, exit: { position: { x: 3, y: 3 }, requiredItemId: 'key' } } as never;
  await assert.rejects(() => manager.loadMap(level), /Couches Tiled manquantes/);
});

test('LevelManager refuse une couche Tiled avec un type incompatible', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    width: 2, height: 2, tilewidth: 32, tileheight: 32,
    layers: [
      { name: 'Ground', type: 'objectgroup', objects: [] },
      { name: 'Decorations', type: 'objectgroup', objects: [] },
      { name: 'Collisions', type: 'objectgroup', objects: [] },
      { name: 'Objects', type: 'objectgroup', objects: [] },
    ],
  }));
  const manager = new LevelManager('/index.json', fetcher);
  const level = { id: 'level-08', map: { path: '/map.json' } } as never;
  await assert.rejects(() => manager.loadMap(level), /Types de couches Tiled invalides/);
});
