import Phaser from 'phaser';
import type { LevelDefinition, TiledMapJson } from '../models/game';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { LevelManager } from '../managers/LevelManager';
import { PixelButton } from '../ui/PixelButton';
import { IntroDialogue } from '../ui/IntroDialogue';
import { ResponsiveLayoutManager } from '../ui/layout/ResponsiveLayoutManager';
import { UITheme } from '../ui/theme/UITheme';
import { markQaState } from '../diagnostics/QaMarker';
import { publicUrl } from '../core/publicUrl';
import { assetsForLevel } from '../data/AssetManifest';
import { enqueueAssets } from '../phaser/AssetLoader';

export class NewGameScene extends Phaser.Scene {
  private session!: GameSession;
  private i18n!: I18nManager;
  private level!: LevelDefinition;
  private progressFill?: Phaser.GameObjects.Rectangle;
  private progressLabel?: Phaser.GameObjects.Text;
  private progressWidth = 1;
  private loadError: string | null = null;
  private transitioning = false;
  private loadingStartedAt = 0;
  private layout!: ResponsiveLayoutManager;
  private introVisible = false;
  private introDialogue?: IntroDialogue;

  public constructor() { super('NewGameScene'); }

  public init(): void {
    this.session = this.registry.get('session') as GameSession;
    this.i18n = new I18nManager(this.session.locale);
    this.level = (this.registry.get('levels') as LevelDefinition[]).find((item) => item.id === 'level-01')!;
    this.layout = new ResponsiveLayoutManager(this);
    this.layout.onResize(() => { if (this.introVisible) this.showIntroduction(); });
  }

  public preload(): void {
    markQaState('loading');
    this.loadingStartedAt = performance.now();
    this.i18n.applyDirection(this.game.canvas);
    this.drawLoadingScreen();
    this.load.on('progress', (value: number) => this.updateProgress(value));
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.loadError = this.i18n.text('assetMissing') + ' : ' + file.key + ' (' + file.url + ')';
    });
    this.load.json('new-game-level-map', publicUrl(this.level.map.path));
    this.load.json('new-game-level-definition', publicUrl('/data/levels/level-01.json'));
    const assets = assetsForLevel(this.level.id);
    enqueueAssets(this, assets.images, assets.spriteSheets);
  }

  public create(): void {
    if (this.loadError) {
      this.showLoadError(this.loadError);
      return;
    }
    const levelManager = this.registry.get('levelManager') as LevelManager;
    const map = this.cache.json.get('new-game-level-map') as TiledMapJson;
    const definition = this.cache.json.get('new-game-level-definition') as LevelDefinition;
    if (definition?.id !== this.level.id || !map?.layers) {
      this.showLoadError(this.i18n.text('mapLoadError'));
      return;
    }
    levelManager.primeMap(this.level, map);
    const minimumScreenTime = 450;
    const remaining = Math.max(0, minimumScreenTime - (performance.now() - this.loadingStartedAt));
    this.time.delayedCall(remaining, () => this.showIntroduction());
  }

  private drawLoadingScreen(): void {
    const { width, height, margin, compact } = this.layout.current;
    this.cameras.main.setBackgroundColor('#142944');
    const scale = Math.max(width / 1672, height / 941);
    this.add.image(width / 2, height / 2, 'menu-background-v2').setScale(scale).setAlpha(0.62);
    this.add.rectangle(width / 2, height / 2, width, height, 0x10172b, 0.46);
    this.add.image(width / 2, height * 0.55, 'midou-menu-v2').setDisplaySize(compact ? 92 : 128, compact ? 92 : 128).setAlpha(0.95);
    this.add.image(width / 2, height * 0.32, 'menu-panel').setDisplaySize(Math.min(640, width - margin * 2), compact ? 190 : 230);
    this.add.text(width / 2, height * 0.16, 'GITQUEST', { fontFamily: UITheme.fontFamily, fontSize: compact ? '32px' : '48px', color: '#f7d56a', stroke: '#10172b', strokeThickness: compact ? 5 : 7 }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.31, this.i18n.text('loadingTitle'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '15px' : '20px', color: '#fff6df', align: 'center', wordWrap: { width: width - margin * 2 } }).setOrigin(0.5);
    this.progressWidth = Math.min(540, width - margin * 2);
    const progressX = (width - this.progressWidth) / 2;
    const progressY = height * 0.41;
    this.add.rectangle(progressX, progressY, this.progressWidth, 16, 0x273e68, 1).setOrigin(0).setStrokeStyle(2, 0x10172b);
    this.progressFill = this.add.rectangle(progressX + 2, progressY + 2, 1, 12, 0xf7c84b, 1).setOrigin(0);
    this.progressLabel = this.add.text(width / 2, progressY + 34, this.i18n.text('loadingMap'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '11px' : '13px', color: '#fff6df', align: 'center', wordWrap: { width: width - margin * 2 } }).setOrigin(0.5);
  }

  private updateProgress(value: number): void {
    this.progressFill?.setDisplaySize(Math.max(1, (this.progressWidth - 4) * value), 12);
    this.progressLabel?.setText(this.i18n.text('loadingMap') + ' ' + Math.round(value * 100) + '%');
  }

  private showIntroduction(): void {
    markQaState('introduction');
    this.introVisible = true;
    this.children.removeAll(true);
    this.introDialogue = undefined;
    const { width, height, margin, compact, portrait } = this.layout.current;
    this.cameras.main.setBackgroundColor('#142944');
    const scale = Math.max(width / 1672, height / 941);
    this.add.image(width / 2, height / 2, 'menu-background-v2').setScale(scale).setAlpha(0.9);
    const foregroundHeight = width * 941 / 1672;
    this.add.image(width / 2, height - foregroundHeight / 2, 'menu-foreground-v3').setDisplaySize(width, foregroundHeight).setAlpha(0.82);
    this.add.rectangle(width / 2, height / 2, width, height, 0x10172b, 0.28);
    this.add.rectangle(width / 2, height * 0.40, width, height * 0.42, 0x10172b, 0.08);
    this.introDialogue = new IntroDialogue(this, this.i18n, this.layout, {
      onStart: () => this.startLevel(),
      onSkip: () => this.startLevel(),
    });
  }

  private startLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    markQaState('transition');
    this.session.levelId = this.level.id;
    this.session.save();
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(350, () => {
      this.scene.start('WorldScene', { levelId: this.level.id });
      this.scene.launch('UIScene');
    });
  }

  private showLoadError(message: string): void {
    this.children.removeAll(true);
    const { width, height, margin } = this.layout.current;
    this.add.rectangle(width / 2, height / 2, Math.min(720, width - margin * 2), Math.min(250, height - margin * 2), 0x10172b, 0.98).setStrokeStyle(3, 0xd96565);
    this.add.text(width / 2, height / 2 - 75, 'GitQuest', { fontFamily: 'monospace', fontSize: '28px', color: '#f7d56a' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 15, message, { fontFamily: 'monospace', fontSize: '15px', color: '#ffb0b0', align: 'center', wordWrap: { width: Math.min(620, width - margin * 2) } }).setOrigin(0.5);
    const retry = new PixelButton(this, this.i18n.text('retry'), { width: 180, height: 46, fontSize: '16px' }).setPosition(width / 2, height / 2 + 75);
    retry.onPress(() => this.scene.restart());
  }
}
