import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

export class InventoryBar extends ResponsivePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly items: Phaser.GameObjects.Container;

  public constructor(scene: Phaser.Scene) {
    super(scene, 170, 34, { fillColor: UITheme.colors.panelRaised, fillAlpha: 0.9, borderWidth: 1 });
    this.title = scene.add.text(10, 8, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.textMuted });
    this.add(this.title);
    this.items = scene.add.container(10, 23);
    this.add(this.items);
  }

  public setItems(items: string[], i18n: I18nManager): this {
    this.title.setText(`${i18n.text('inventory')} · ${items.length}`);
    this.items.removeAll(true);
    items.slice(0, 5).forEach((item, index) => {
      const key = item === 'pass-key' ? 'key' : 'chest';
      const image = this.scene.add.image(index * 27 + 10, 0, key).setDisplaySize(20, 20);
      this.items.add(image);
    });
    this.setPanelSize(Math.max(150, 28 + Math.min(5, items.length) * 27), 34);
    return this;
  }
}
