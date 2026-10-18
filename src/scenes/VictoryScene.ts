import Phaser from 'phaser';
import type { GameSession } from '../core/GameSession';
import { I18nManager } from '../managers/I18nManager';
import { markQaState } from '../diagnostics/QaMarker';
import { ResponsiveLayoutManager, type LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';
import { UITheme } from '../ui/theme/UITheme';

export class VictoryScene extends Phaser.Scene {
  private layout!: ResponsiveLayoutManager;
  private backdrop!: Phaser.GameObjects.Image;
  private foreground!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Rectangle;
  private card!: Phaser.GameObjects.Rectangle;
  private cardAccent!: Phaser.GameObjects.Rectangle;
  private cardShadow!: Phaser.GameObjects.Rectangle;
  private duo!: Phaser.GameObjects.Image;
  private title!: Phaser.GameObjects.Text;
  private eyebrow!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private totalXp!: Phaser.GameObjects.Text;
  private replay!: Phaser.GameObjects.Text;
  public constructor() { super('VictoryScene'); }

  public create(): void {
    markQaState('victory');
    const session = this.registry.get('session') as GameSession;
    const i18n = new I18nManager(session.locale);
    i18n.applyDirection(this.game.canvas);
    this.cameras.main.setBackgroundColor('#111a33');

    // Reuse the authored menu layers instead of creating a second, unrelated
    // victory illustration. The scene remains data/UI-only and does not alter
    // the saved progression or level definitions.
    this.backdrop = this.add.image(0, 0, 'menu-background-v2').setOrigin(0).setDepth(0);
    this.glow = this.add.rectangle(0, 0, 10, 10, 0x10172b, 0.28).setOrigin(0).setDepth(1);
    this.foreground = this.add.image(0, 0, 'menu-foreground-v3').setOrigin(0).setDepth(2);
    this.duo = this.add.image(0, 0, 'menu-duo-v3').setDepth(3).setAlpha(0.96);
    this.cardShadow = this.add.rectangle(0, 0, 10, 10, UITheme.colors.panelShadow, 0.66).setOrigin(0).setDepth(4);
    this.card = this.add.rectangle(0, 0, 10, 10, UITheme.colors.panel, 0.94).setOrigin(0).setStrokeStyle(3, UITheme.colors.borderAccent).setDepth(5);
    this.cardAccent = this.add.rectangle(0, 0, 10, 4, UITheme.colors.goldSoft, 1).setOrigin(0).setDepth(6);
    this.eyebrow = this.add.text(0, 0, i18n.text('title'), { fontFamily: UITheme.fontFamily, fontSize: '13px', color: UITheme.colors.textMuted, align: 'center' }).setOrigin(0.5).setDepth(7);
    this.title = this.add.text(0, 0, i18n.text('victoryTitle'), { fontFamily: UITheme.fontFamily, fontSize: '48px', color: UITheme.colors.accent, stroke: '#10172b', strokeThickness: 7, align: 'center' }).setOrigin(0.5).setDepth(7);
    this.message = this.add.text(0, 0, i18n.text('victoryMessage'), { fontFamily: UITheme.fontFamily, fontSize: '20px', color: UITheme.colors.text, align: 'center' }).setOrigin(0.5).setDepth(7);
    this.totalXp = this.add.text(0, 0, i18n.text('totalXp') + '  ·  ' + session.xp.value, { fontFamily: UITheme.fontFamily, fontSize: '16px', color: UITheme.colors.success, align: 'center' }).setOrigin(0.5).setDepth(7);
    this.replay = this.add.text(0, 0, i18n.text('replay'), { fontFamily: UITheme.fontFamily, fontSize: '20px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 28, y: 11 }, align: 'center' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(8);
    this.replay.on('pointerdown', () => { session.reset(); session.save(); this.scene.start('WorldScene', { levelId: 'level-01' }); this.scene.launch('UIScene'); });
    this.layout = new ResponsiveLayoutManager(this);
    this.layout.onResize((metrics) => this.applyLayout(metrics));
    this.tweens.add({ targets: this.glow, alpha: { from: 0.18, to: 0.34 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.duo, y: '+=3', duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  private applyLayout(metrics: LayoutMetrics): void {
    const centerX = metrics.width / 2;
    const compact = metrics.compact || metrics.portrait;
    const width = metrics.width;
    const height = metrics.height;
    const cardWidth = Math.min(compact ? width - metrics.margin * 2 : 540, width - metrics.margin * 2);
    const cardHeight = compact ? Math.min(300, height - metrics.margin * 2) : 360;
    const cardX = (width - cardWidth) / 2;
    const cardY = compact ? Math.max(metrics.margin, (height - cardHeight) / 2) : Math.max(metrics.margin, height * 0.16);

    this.backdrop.setPosition(0, 0).setDisplaySize(width, height);
    this.glow.setPosition(0, 0).setSize(width, height);
    this.foreground.setPosition(0, height * 0.48).setDisplaySize(width, Math.max(1, height * 0.52));
    const duoSize = compact ? Math.min(190, width * 0.48) : 280;
    this.duo.setPosition(compact ? width * 0.18 : width * 0.19, height * 0.73).setDisplaySize(duoSize, duoSize);

    this.cardShadow.setPosition(cardX + 8, cardY + 9).setSize(cardWidth, cardHeight);
    this.card.setPosition(cardX, cardY).setSize(cardWidth, cardHeight);
    this.cardAccent.setPosition(cardX, cardY).setSize(cardWidth, 4);
    this.eyebrow.setPosition(centerX, cardY + 38).setFontSize(compact ? '10px' : '13px').setWordWrapWidth(cardWidth - 32);
    this.title.setPosition(centerX, cardY + (compact ? 78 : 92)).setFontSize(compact ? '28px' : '48px');
    this.message.setPosition(centerX, cardY + (compact ? 142 : 172)).setFontSize(compact ? '14px' : '20px').setWordWrapWidth(cardWidth - 40);
    this.totalXp.setPosition(centerX, cardY + (compact ? 194 : 234)).setFontSize(compact ? '13px' : '16px');
    this.replay.setPosition(centerX, cardY + cardHeight - (compact ? 42 : 52)).setFontSize(compact ? '16px' : '20px');
  }
}
