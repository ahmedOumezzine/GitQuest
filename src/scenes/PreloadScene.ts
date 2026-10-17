import Phaser from 'phaser';
import { I18nManager } from '../managers/I18nManager';
import type { LevelDefinition } from '../models/game';
import { resolveQaLevelId, resolveQaScene } from '../diagnostics/QaRoute';
import { imageAssets, spriteSheetAssets } from '../data/AssetManifest';
import { markQaState } from '../diagnostics/QaMarker';
import { publicUrl } from '../core/publicUrl';

type SessionLike = { locale?: import('../models/game').Locale };

export class PreloadScene extends Phaser.Scene {
  private loadError: string | null = null;
  private i18n = new I18nManager();
  public constructor() { super('PreloadScene'); }

  public preload(): void {
    markQaState('preload');
    const session = this.registry.get('session') as SessionLike | undefined;
    this.i18n = new I18nManager(session?.locale ?? 'fr');
    this.i18n.applyDirection(this.game.canvas);
    this.load.on('loaderror', (file: Phaser.Loader.File) => { this.loadError = this.i18n.text('assetMissing') + ' : ' + file.key + ' (' + file.url + ')'; });
    imageAssets.forEach((asset) => this.load.image(asset.key, publicUrl(asset.path)));
    spriteSheetAssets.forEach((asset) => this.load.spritesheet(asset.key, publicUrl(asset.path), { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight }));
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GITQUEST', { fontFamily: 'monospace', fontSize: '32px', color: '#f7d56a' }).setOrigin(0.5);
  }

  public create(): void {
    if (this.loadError) { this.showLoadError(this.loadError); return; }
    this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('player-sheet', { start: 0, end: 2 }), frameRate: 7, repeat: -1 });
    this.anims.create({ key: 'midou-idle', frames: this.anims.generateFrameNumbers('midou-sheet', { start: 0, end: 2 }), frameRate: 3, repeat: -1 });
    const directions = { down: 0, left: 3, up: 6, right: 9 };
    Object.entries(directions).forEach(([direction, start]) => {
      this.anims.create({ key: 'player-walk-' + direction, frames: this.anims.generateFrameNumbers('player-4dir', { start, end: start + 2 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'midou-idle-' + direction, frames: this.anims.generateFrameNumbers('midou-4dir', { start, end: start + 2 }), frameRate: 3, repeat: -1 });
      this.anims.create({ key: 'level-01-player-walk-' + direction, frames: this.anims.generateFrameNumbers('level-01-player-sheet-v1', { start, end: start + 2 }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'level-01-midou-idle-' + direction, frames: this.anims.generateFrameNumbers('level-01-midou-sheet-v1', { start, end: start + 2 }), frameRate: 3, repeat: -1 });
    });
    const levels = this.registry.get('levels') as LevelDefinition[];
    const qaSearch = typeof window !== 'undefined' ? window.location.search : '';
    if (resolveQaScene(qaSearch) === 'victory') {
      this.scene.start('VictoryScene');
      return;
    }
    const qaLevelId = resolveQaLevelId(qaSearch, levels.map((level) => level.id));
    if (qaLevelId) {
      this.scene.start('WorldScene', { levelId: qaLevelId });
      this.scene.launch('UIScene');
      return;
    }
    this.scene.start('TitleScene');
  }

  private showLoadError(message: string): void {
    this.children.removeAll(true);
    const width = this.scale.width;
    const height = this.scale.height;
    const panelWidth = Math.min(720, Math.max(260, width - 32));
    const panelHeight = Math.min(250, Math.max(210, height - 32));
    const centerX = width / 2;
    const centerY = height / 2;
    this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x10172b, 0.98).setStrokeStyle(3, 0xd96565);
    this.add.text(centerX, centerY - panelHeight / 2 + 42, this.i18n.text('assetMissing'), { fontFamily: 'monospace', fontSize: width < 500 ? '20px' : '26px', color: '#ff9b9b' }).setOrigin(0.5);
    this.add.text(centerX, centerY, message, { fontFamily: 'monospace', fontSize: '15px', color: '#fff6df', align: 'center', wordWrap: { width: panelWidth - 44 } }).setOrigin(0.5);
    const retry = this.add.text(centerX, centerY + panelHeight / 2 - 38, this.i18n.text('retry'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 20, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.restart());
  }
}
