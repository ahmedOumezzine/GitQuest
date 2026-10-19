import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

/** Compact level-one status card inspired by the premium beach HUD composition. */
export class BeachStatusCard extends ResponsivePanel {
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly level: Phaser.GameObjects.Text;
  private readonly xp: Phaser.GameObjects.Text;
  private readonly inventory: Phaser.GameObjects.Text;
  private readonly xpTrack: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;

  public constructor(scene: Phaser.Scene) {
    super(scene, 250, 70, { fillColor: UITheme.colors.panel, fillAlpha: 0.96, borderWidth: 2 });
    this.portrait = scene.add.image(32, 31, 'level-01-player-v1').setDisplaySize(40, 48).setOrigin(0.5);
    this.level = scene.add.text(62, 9, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.accent, stroke: '#10172b', strokeThickness: 2 });
    this.xp = scene.add.text(62, 28, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.text });
    this.xpTrack = scene.add.rectangle(62, 46, 174, 6, UITheme.colors.panelLine).setOrigin(0, 0.5);
    this.xpFill = scene.add.rectangle(62, 46, 1, 6, UITheme.colors.buttonSelected).setOrigin(0, 0.5);
    this.inventory = scene.add.text(62, 55, '', { fontFamily: UITheme.fontFamily, fontSize: '9px', color: UITheme.colors.textMuted });
    this.add([this.portrait, this.level, this.xp, this.xpTrack, this.xpFill, this.inventory]);
  }

  public setStats(xpValue: number, inventoryCount: number, i18n: I18nManager): this {
    if (this.scene.textures.exists('level-01-player-v1')) {
      this.portrait.setTexture('level-01-player-v1');
    } else if (this.scene.textures.exists('level-01-player-sheet-v1')) {
      this.portrait.setTexture('level-01-player-sheet-v1', 1);
    }
    this.portrait.setDisplaySize(40, 48);
    const level = Math.floor(xpValue / 100) + 1;
    this.level.setText(`${i18n.text('level')} ${level}`);
    this.xp.setText(`${i18n.text('xp')} ${xpValue} / 100`);
    this.inventory.setText(`▣ ${i18n.text('inventory')} · ${inventoryCount}`);
    this.xpFill.setDisplaySize(Math.max(2, 174 * Math.max(0, Math.min(1, (xpValue % 100) / 100))), 6);
    const rtl = i18n.direction === 'rtl';
    [this.level, this.xp, this.inventory].forEach((label) => label.setOrigin(rtl ? 1 : 0, 0).setStyle({ align: rtl ? 'right' : 'left' }));
    const textX = rtl ? 238 : 62;
    this.level.setPosition(textX, 10);
    this.xp.setPosition(textX, 29);
    this.xpTrack.setPosition(rtl ? 64 : 62, 46);
    this.xpFill.setPosition(rtl ? 64 : 62, 46);
    this.inventory.setPosition(textX, 55);
    this.portrait.setPosition(rtl ? 218 : 32, 35);
    return this;
  }
}
