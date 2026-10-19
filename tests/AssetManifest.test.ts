import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { assetsForLevel, imageAssets, menuImageAssets, spriteSheetAssets } from '../src/data/AssetManifest';

test('tous les assets demandés par PreloadScene existent localement', async () => {
  for (const asset of [...imageAssets, ...spriteSheetAssets]) {
    assert.ok(asset.path.startsWith('/assets/'), asset.key);
    await access(`public${asset.path}`);
  }
});

test('les spritesheets utilisent une grille déclarée et cohérente', () => {
  spriteSheetAssets.forEach((asset) => {
    const expected = asset.key.startsWith('level-01-') ? 96 : 32;
    assert.equal(asset.frameWidth, expected, asset.key);
    assert.equal(asset.frameHeight, expected, asset.key);
  });
});

test('le menu ne charge pas les assets régionaux avant une partie', () => {
  assert.ok(menuImageAssets.some((asset) => asset.key === 'menu-background-v2'));
  assert.ok(menuImageAssets.some((asset) => asset.key === 'menu-logo'));
  assert.ok(menuImageAssets.some((asset) => asset.key === 'midou-portrait-v3'));
  assert.equal(menuImageAssets.some((asset) => asset.key === 'level-02-forest'), false);
  assert.equal(menuImageAssets.some((asset) => asset.key === 'forest-ancient-tree'), false);
});

test('les assets régionaux sont chargés à la demande par niveau', () => {
  const forest = assetsForLevel('level-02');
  const beach = assetsForLevel('level-01');
  assert.ok(forest.images.some((asset) => asset.key === 'level-02-forest'));
  assert.ok(forest.images.some((asset) => asset.key === 'forest-gate-closed'));
  assert.ok(forest.images.some((asset) => asset.key === 'professor-octo-v1'));
  assert.ok(forest.images.some((asset) => asset.key === 'professor-octo-portrait-v1'));
  assert.equal(forest.images.some((asset) => asset.key === 'level-03-cave'), false);
  const cave = assetsForLevel('level-03');
  assert.ok(cave.images.some((asset) => asset.key === 'level-03-cave'));
  assert.ok(cave.images.some((asset) => asset.key === 'professor-octo-v1'));
  assert.ok(cave.images.some((asset) => asset.key === 'cave-commit-altar'));
  const harbor = assetsForLevel('level-04');
  assert.ok(harbor.images.some((asset) => asset.key === 'level-04-harbor'));
  assert.ok(harbor.images.some((asset) => asset.key === 'harbor-connection-altar'));
  assert.ok(harbor.images.some((asset) => asset.key === 'professor-octo-v1'));
  assert.ok(harbor.images.some((asset) => asset.key === 'professor-octo-portrait-v1'));
  assert.equal(harbor.images.some((asset) => asset.key === 'level-05-mountain'), false);
  assert.ok(beach.images.some((asset) => asset.key === 'beach-tileset'));
  assert.ok(beach.spriteSheets.some((asset) => asset.key === 'level-01-player-sheet-v1'));
  assert.ok(beach.spriteSheets.some((asset) => asset.key === 'player-sheet'));
});
