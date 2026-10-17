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

test('les spritesheets conservent la grille pixel de 32 pixels', () => {
  spriteSheetAssets.forEach((asset) => {
    assert.equal(asset.frameWidth, 32, asset.key);
    assert.equal(asset.frameHeight, 32, asset.key);
  });
});
