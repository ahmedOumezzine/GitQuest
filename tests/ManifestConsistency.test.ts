import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('le manifest référence exactement les six définitions et leurs cartes', async () => {
  const index = JSON.parse(await readFile('public/data/levels/index.json', 'utf8')) as { levels: string[] };
  assert.deepEqual(index.levels, Array.from({ length: 6 }, (_, index) => `/data/levels/level-0${index + 1}.json`));
  for (const path of index.levels) {
    const level = JSON.parse(await readFile(`public${path}`, 'utf8')) as { id: string; map: { path: string } };
    assert.equal(level.map.path, `/data/maps/${level.id}.json`);
    await access(`public${level.map.path}`);
  }
});
