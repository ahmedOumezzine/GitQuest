import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { markQaState } from '../diagnostics/QaMarker';
import { ResponsiveLayoutManager, type LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';

export class VictoryScene extends Phaser.Scene {
  private layout!: ResponsiveLayoutManager;
  private title!: Phaser.GameObjects.Text;
  private player!: Phaser.GameObjects.Image;
  private message!: Phaser.GameObjects.Text;
  private totalXp!: Phaser.GameObjects.Text;
  private replay!: Phaser.GameObjects.Text;
  public constructor() { super('VictoryScene'); }

  public create(): void {
    markQaState('victory');
    const session = this.registry.get('session') as GameSession;
    const i18n = new I18nManager(session.locale);
    i18n.applyDirection(this.game.canvas);
    this.cameras.main.setBackgroundColor('#241b3d');
    this.title = this.add.text(0, 0, i18n.text('victoryTitle'), { fontFamily: 'monospace', fontSize: '48px', color: '#f7d56a', stroke: '#10172b', strokeThickness: 7, align: 'center' }).setOrigin(0.5);
    this.player = this.add.image(0, 0, 'player-menu-v2');
    this.message = this.add.text(0, 0, i18n.text('victoryMessage'), { fontFamily: 'monospace', fontSize: '20px', color: '#fff6df', align: 'center' }).setOrigin(0.5);
    this.totalXp = this.add.text(0, 0, i18n.text('totalXp') + ' : ' + session.xp.value, { fontFamily: 'monospace', fontSize: '16px', color: '#9ef0c1', align: 'center' }).setOrigin(0.5);
    this.replay = this.add.text(0, 0, i18n.text('replay'), { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 24, y: 10 }, align: 'center' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.replay.on('pointerdown', () => { session.reset(); session.save(); this.scene.start('WorldScene', { levelId: 'level-01' }); this.scene.launch('UIScene'); });
    this.layout = new ResponsiveLayoutManager(this);
    this.layout.onResize((metrics) => this.applyLayout(metrics));
  }

  private applyLayout(metrics: LayoutMetrics): void {
    const centerX = metrics.width / 2;
    const compact = metrics.compact || metrics.portrait;
    this.title.setPosition(centerX, Math.max(metrics.margin + 30, metrics.height * 0.16)).setFontSize(compact ? '28px' : '48px');
    const characterSize = compact ? 96 : 128;
    this.player.setPosition(centerX, metrics.height * 0.42).setDisplaySize(characterSize, characterSize);
    this.message.setPosition(centerX, metrics.height * 0.63).setFontSize(compact ? '15px' : '20px').setWordWrapWidth(Math.max(180, metrics.width - metrics.margin * 2));
    this.totalXp.setPosition(centerX, metrics.height * 0.70).setFontSize(compact ? '14px' : '16px');
    this.replay.setPosition(centerX, metrics.height - metrics.margin - 30).setFontSize(compact ? '16px' : '20px');
  }
}
