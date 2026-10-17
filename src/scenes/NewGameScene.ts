import Phaser from 'phaser';
import type { LevelDefinition, TiledMapJson } from '../models/game';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { LevelManager } from '../managers/LevelManager';
import { PixelButton } from '../ui/PixelButton';
import { ResponsiveLayoutManager } from '../ui/layout/ResponsiveLayoutManager';
import { UITheme } from '../ui/theme/UITheme';

export class NewGameScene extends Phaser.Scene {
  private session!: GameSession;
  private i18n!: I18nManager;
  private level!: LevelDefinition;
  private progressFill?: Phaser.GameObjects.Rectangle;
  private progressLabel?: Phaser.GameObjects.Text;
  private loadError: string | null = null;
  private transitioning = false;
  private loadingStartedAt = 0;
  private layout!: ResponsiveLayoutManager;
  private introVisible = false;

  public constructor() { super('NewGameScene'); }

  public init(): void {
    this.session = this.registry.get('session') as GameSession;
    this.i18n = new I18nManager(this.session.locale);
    this.level = (this.registry.get('levels') as LevelDefinition[]).find((item) => item.id === 'level-01')!;
    this.layout = new ResponsiveLayoutManager(this);
    this.layout.onResize(() => { if (this.introVisible) this.showIntroduction(); });
  }

  public preload(): void {
    this.loadingStartedAt = performance.now();
    this.game.canvas?.setAttribute('dir', 'ltr');
    this.drawLoadingScreen();
    this.load.on('progress', (value: number) => this.updateProgress(value));
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.loadError = 'Asset introuvable : ' + file.key + ' (' + file.url + ')';
    });
    this.load.json('new-game-level-map', this.level.map.path);
    this.load.json('new-game-level-definition', '/data/levels/level-01.json');
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
      this.showLoadError('Les données du niveau 1 sont incomplètes.');
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
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a3152, 1).fillRect(0, 0, width, height * 0.39);
    graphics.fillStyle(0x6d6076, 1).fillRect(0, height * 0.39, width, height * 0.06);
    graphics.fillStyle(0x1c3e5d, 1).fillRect(0, height * 0.45, width, height * 0.55);
    graphics.fillStyle(0x27718a, 1).fillRect(0, height * 0.72, width, height * 0.28);
    for (let x = 0; x < width; x += 64) graphics.fillStyle(0x8bd1c7, 0.55).fillRect(x + 12, height * 0.8 + (x % 3) * 12, 26, 3);
    this.add.image(width / 2, height * 0.61, 'midou').setDisplaySize(compact ? 92 : 128, compact ? 92 : 128).setAlpha(0.9);
    this.add.text(width / 2, height * 0.16, 'GITQUEST', { fontFamily: UITheme.fontFamily, fontSize: compact ? '32px' : '48px', color: '#f7d56a', stroke: '#10172b', strokeThickness: compact ? 5 : 7 }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.29, this.i18n.text('loadingTitle'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '15px' : '20px', color: '#fff6df', align: 'center', wordWrap: { width: width - margin * 2 } }).setOrigin(0.5);
    const progressWidth = Math.min(540, width - margin * 2);
    this.add.rectangle((width - progressWidth) / 2, height - margin - 52, progressWidth, 16, 0x273e68, 1).setOrigin(0).setStrokeStyle(2, 0x10172b);
    this.progressFill = this.add.rectangle((width - progressWidth) / 2 + 2, height - margin - 50, 1, 12, 0xf7c84b, 1).setOrigin(0);
    this.progressLabel = this.add.text(width / 2, height - margin - 20, this.i18n.text('loadingMap'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '11px' : '13px', color: '#fff6df', align: 'center', wordWrap: { width: width - margin * 2 } }).setOrigin(0.5);
  }

  private updateProgress(value: number): void {
    this.progressFill?.setDisplaySize(Math.max(1, 536 * value), 12);
    this.progressLabel?.setText(this.i18n.text('loadingMap') + ' ' + Math.round(value * 100) + '%');
  }

  private showIntroduction(): void {
    this.introVisible = true;
    this.children.removeAll(true);
    const { width, height, margin, compact, portrait } = this.layout.current;
    this.cameras.main.setBackgroundColor('#142944');
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a3152, 1).fillRect(0, 0, width, height * 0.43);
    graphics.fillStyle(0x6d6076, 1).fillRect(0, height * 0.43, width, height * 0.05);
    graphics.fillStyle(0x27718a, 1).fillRect(0, height * 0.48, width, height * 0.52);
    graphics.fillStyle(0xf9cf78, 0.9).fillCircle(width * 0.8, height * 0.53, Math.min(32, width * 0.07));
    for (let x = 0; x < width; x += 64) graphics.fillStyle(0x8bd1c7, 0.5).fillRect(x + 8, height * 0.75 + (x % 3) * 12, 30, 3);
    if (!portrait) {
      this.add.image(width * 0.13, height * 0.65, 'palm').setDisplaySize(110, 165).setFlipX(true).setAlpha(0.9);
      this.add.image(width * 0.86, height * 0.65, 'lighthouse').setDisplaySize(50, 88).setAlpha(0.9);
    }
    const panelWidth = Math.min(670, width - margin * 2);
    const panelHeight = Math.min(430, height - margin * 2);
    const panelY = height / 2 + (compact ? 8 : 16);
    this.add.rectangle(width / 2, panelY, panelWidth, panelHeight, 0x10172b, 0.94).setStrokeStyle(4, 0xf7d56a);
    if (!portrait) this.add.image(width * 0.3, panelY + 60, 'midou').setDisplaySize(100, 100).setDepth(2);
    this.add.text(width / 2, Math.max(margin + 18, panelY - panelHeight / 2 + 38), this.i18n.text('introTitle'), { fontFamily: UITheme.fontFamily, fontSize: compact ? '19px' : '26px', color: '#f7d56a', stroke: '#10172b', strokeThickness: 5, align: 'center', wordWrap: { width: panelWidth - 36 } }).setOrigin(0.5).setDepth(2);
    const narrative = [this.i18n.text('introLine1'), this.i18n.text('introLine2'), this.i18n.text('introLine3')].join('\n\n');
    const textWidth = portrait ? panelWidth - 36 : Math.min(400, panelWidth - 230);
    const textX = portrait ? width / 2 : width / 2 + 100;
    const textY = portrait ? panelY - 24 : panelY - 14;
    this.add.text(textX, textY, narrative, { fontFamily: UITheme.fontFamily, fontSize: compact ? '12px' : '16px', color: '#fff6df', align: this.i18n.direction === 'rtl' ? 'right' : 'left', wordWrap: { width: Math.max(170, textWidth) }, lineSpacing: compact ? 4 : 8 }).setOrigin(0.5).setDepth(2);
    const stacked = portrait || panelWidth < 500;
    const buttonsY = panelY + panelHeight / 2 - (stacked ? 64 : (compact ? 42 : 36));
    const startWidth = stacked ? panelWidth - 42 : 230;
    const skipWidth = stacked ? panelWidth - 42 : 150;
    const startButton = new PixelButton(this, this.i18n.text('startAdventure'), { width: startWidth, height: UITheme.minTouchTarget, fontSize: compact ? '13px' : '15px' }).setPosition(stacked ? width / 2 : width / 2 - 130, stacked ? buttonsY - 27 : buttonsY);
    startButton.onPress(() => this.startLevel());
    const skipButton = new PixelButton(this, this.i18n.text('skip'), { width: skipWidth, height: UITheme.minTouchTarget, fontSize: compact ? '13px' : '15px' }).setPosition(stacked ? width / 2 : width / 2 + 130, stacked ? buttonsY + 27 : buttonsY);
    skipButton.onPress(() => this.startLevel());
  }

  private startLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
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
    this.add.rectangle(480, 270, 720, 250, 0x10172b, 0.98).setStrokeStyle(3, 0xd96565);
    this.add.text(480, 195, 'GitQuest', { fontFamily: 'monospace', fontSize: '28px', color: '#f7d56a' }).setOrigin(0.5);
    this.add.text(480, 255, message, { fontFamily: 'monospace', fontSize: '15px', color: '#ffb0b0', align: 'center', wordWrap: { width: 620 } }).setOrigin(0.5);
    const retry = new PixelButton(this, this.i18n.text('retry'), { width: 180, height: 46, fontSize: '16px' }).setPosition(480, 345);
    retry.onPress(() => this.scene.restart());
  }
}
