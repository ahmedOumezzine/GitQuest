import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { imageAssets, spriteSheetAssets } from '../src/data/AssetManifest';

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
