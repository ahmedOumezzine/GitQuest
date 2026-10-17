import Phaser from 'phaser';
import type { GitOperation } from '../../models/game';
import type { I18nManager } from '../../managers/I18nManager';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

export class CommandHint extends ResponsivePanel {
  private readonly text: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene) {
    super(scene, 260, 36, { fillColor: UITheme.colors.panel, fillAlpha: 0.94, borderWidth: 1 });
    this.text = scene.add.text(12, 9, '', { fontFamily: UITheme.fontFamily, fontSize: '11px', color: UITheme.colors.accent, wordWrap: { width: 236 } });
    this.add(this.text);
  }

  public setHint(i18n: I18nManager, operation?: GitOperation): this {
    this.text.setText(i18n.commandHint(operation));
    return this;
  }

  public setHintWidth(width: number): this {
    const safeWidth = Math.max(160, width);
    this.setPanelSize(safeWidth, 36);
    this.text.setWordWrapWidth(safeWidth - 24);
    return this;
  }
}
