import Phaser from 'phaser';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

export class XPBar extends ResponsivePanel {
  private readonly label: Phaser.GameObjects.Text;
  private readonly track: Phaser.GameObjects.Rectangle;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private widthValue = 150;

  public constructor(scene: Phaser.Scene) {
    super(scene, 180, 34, { fillColor: UITheme.colors.panelRaised, fillAlpha: 0.94, borderWidth: 1 });
    this.label = scene.add.text(10, 6, 'XP 0', { fontFamily: UITheme.fontFamily, fontSize: '11px', color: UITheme.colors.text, stroke: '#10172b', strokeThickness: 1 });
    this.track = scene.add.rectangle(52, 17, this.widthValue, 8, 0x354268).setOrigin(0, 0.5);
    this.fill = scene.add.rectangle(52, 17, 1, 8, UITheme.colors.buttonSelected).setOrigin(0, 0.5);
    this.add([this.label, this.track, this.fill]);
  }

  public setBarWidth(width: number): this {
    this.widthValue = Math.max(72, width);
    this.setPanelSize(this.widthValue + 58, 34);
    this.track.setPosition(52, 17).setSize(this.widthValue, 8);
    return this;
  }

  public setValue(value: number, segment = 100): this {
    const progress = Math.max(0, Math.min(1, segment > 0 ? (value % segment) / segment : 0));
    this.label.setText(`XP ${value}`);
    this.fill.setPosition(52, 17).setDisplaySize(Math.max(2, this.widthValue * progress), 8);
    return this;
  }
}
