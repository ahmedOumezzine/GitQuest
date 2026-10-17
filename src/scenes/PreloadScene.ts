import Phaser from 'phaser';
import { I18nManager } from '../managers/I18nManager';
import type { LevelDefinition } from '../models/game';
import { resolveQaLevelId } from '../diagnostics/QaRoute';
import { imageAssets, spriteSheetAssets } from '../data/AssetManifest';

type SessionLike = { locale?: import('../models/game').Locale };

export class PreloadScene extends Phaser.Scene {
  private loadError: string | null = null;
  private i18n = new I18nManager();
  public constructor() { super('PreloadScene'); }

  public preload(): void {
    const session = this.registry.get('session') as SessionLike | undefined;
    this.i18n = new I18nManager(session?.locale ?? 'fr');
    this.i18n.applyDirection(this.game.canvas);
    this.load.on('loaderror', (file: Phaser.Loader.File) => { this.loadError = this.i18n.text('assetMissing') + ' : ' + file.key + ' (' + file.url + ')'; });
    imageAssets.forEach((asset) => this.load.image(asset.key, asset.path));
    spriteSheetAssets.forEach((asset) => this.load.spritesheet(asset.key, asset.path, { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight }));
    this.add.text(480, 270, 'GITQUEST', { fontFamily: 'monospace', fontSize: '32px', color: '#f7d56a' }).setOrigin(0.5);
  }

  public create(): void {
    if (this.loadError) { this.showLoadError(this.loadError); return; }
    this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('player-sheet', { start: 0, end: 2 }), frameRate: 7, repeat: -1 });
    this.anims.create({ key: 'midou-idle', frames: this.anims.generateFrameNumbers('midou-sheet', { start: 0, end: 2 }), frameRate: 3, repeat: -1 });
    const directions = { down: 0, left: 3, up: 6, right: 9 };
    Object.entries(directions).forEach(([direction, start]) => {
      this.anims.create({ key: 'player-walk-' + direction, frames: this.anims.generateFrameNumbers('player-4dir', { start, end: start + 2 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'midou-idle-' + direction, frames: this.anims.generateFrameNumbers('midou-4dir', { start, end: start + 2 }), frameRate: 3, repeat: -1 });
    });
    const levels = this.registry.get('levels') as LevelDefinition[];
    const qaLevelId = typeof window !== 'undefined' ? resolveQaLevelId(window.location.search, levels.map((level) => level.id)) : undefined;
    if (qaLevelId) {
      this.scene.start('WorldScene', { levelId: qaLevelId });
      this.scene.launch('UIScene');
      return;
    }
    this.scene.start('TitleScene');
  }

  private showLoadError(message: string): void {
    this.children.removeAll(true);
    this.add.rectangle(480, 270, 720, 250, 0x10172b, 0.98).setStrokeStyle(3, 0xd96565);
    this.add.text(480, 200, this.i18n.text('assetMissing'), { fontFamily: 'monospace', fontSize: '26px', color: '#ff9b9b' }).setOrigin(0.5);
    this.add.text(480, 270, message, { fontFamily: 'monospace', fontSize: '15px', color: '#fff6df', align: 'center', wordWrap: { width: 620 } }).setOrigin(0.5);
    const retry = this.add.text(480, 340, this.i18n.text('retry'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 20, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.restart());
  }
}
