import type Phaser from 'phaser';
import type { AssetEntry, SpriteSheetAssetEntry } from '../data/AssetManifest';
import { publicUrl } from '../core/publicUrl';

/** Queue only assets not already present in Phaser's caches. */
export function enqueueAssets(scene: Phaser.Scene, images: AssetEntry[], spriteSheets: SpriteSheetAssetEntry[] = []): void {
  images.forEach((asset) => {
    if (!scene.textures.exists(asset.key)) scene.load.image(asset.key, publicUrl(asset.path));
  });
  spriteSheets.forEach((asset) => {
    if (!scene.textures.exists(asset.key)) {
      scene.load.spritesheet(asset.key, publicUrl(asset.path), {
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      });
    }
  });
}
