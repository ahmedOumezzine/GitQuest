import Phaser from 'phaser';
import { GameSession } from '../core/GameSession';
import { LevelManager } from '../managers/LevelManager';
import { I18nManager } from '../managers/I18nManager';
import { SaveManager } from '../managers/SaveManager';
import { markQaState } from '../diagnostics/QaMarker';

export class BootScene extends Phaser.Scene {
  public constructor() { super('BootScene'); }

  public create(): void {
    markQaState('boot');
    const locale = new SaveManager().load()?.locale ?? 'fr';
    const i18n = new I18nManager(locale);
    i18n.applyDirection(this.game.canvas);
    this.add.text(480, 270, i18n.text('bootLoading'), { fontFamily: 'monospace', fontSize: '24px', color: '#f7d56a' }).setOrigin(0.5);
    void this.loadGame().catch((error: unknown) => this.showLoadError(error));
  }

  private async loadGame(): Promise<void> {
    const levelManager = new LevelManager();
    const levels = await levelManager.loadAll();
    const session = new GameSession();
    session.load();
    if (!levels.some((level) => level.id === session.levelId)) session.levelId = levels[0].id;
    this.registry.set('levelManager', levelManager);
    this.registry.set('levels', levels);
    this.registry.set('session', session);
    this.scene.start('PreloadScene');
  }

  private showLoadError(error: unknown): void {
    const locale = new SaveManager().load()?.locale ?? 'fr';
    const i18n = new I18nManager(locale);
    i18n.applyDirection(this.game.canvas);
    this.children.removeAll(true);
    this.add.rectangle(480, 270, 720, 250, 0x10172b, 0.98).setStrokeStyle(3, 0xd96565);
    this.add.text(480, 190, i18n.text('bootLoadError'), { fontFamily: 'monospace', fontSize: '26px', color: '#ff9b9b' }).setOrigin(0.5);
    this.add.text(480, 255, error instanceof Error ? error.message : String(error), { fontFamily: 'monospace', fontSize: '15px', color: '#fff6df', align: 'center', wordWrap: { width: 620 } }).setOrigin(0.5);
    const retry = this.add.text(480, 335, i18n.text('retry'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 20, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.restart());
  }
}
