import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import type { ObjectiveTarget, ObjectiveTargetKind, Point } from '../../models/game';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';
import { directionArrow } from './CompassMath';

function targetLabel(kind: ObjectiveTargetKind, i18n: I18nManager): string {
  if (kind === 'mentor') return i18n.text('midouName');
  if (kind === 'shrine') return i18n.text('shrine');
  if (kind === 'gate') return i18n.text('gateName');
  return i18n.text('compassObject');
}

/** Compact directional aid. It points at the current quest target only. */
export class Compass extends ResponsivePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly direction: Phaser.GameObjects.Text;
  private readonly target: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene) {
    super(scene, 190, 42, { fillColor: UITheme.colors.panel, fillAlpha: 0.9, borderWidth: 1 });
    this.title = scene.add.text(10, 6, '', { fontFamily: UITheme.fontFamily, fontSize: '9px', color: UITheme.colors.textMuted });
    this.direction = scene.add.text(26, 20, '·', { fontFamily: UITheme.fontFamily, fontSize: '14px', color: UITheme.colors.accent }).setOrigin(0.5, 0);
    this.target = scene.add.text(42, 21, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.text, wordWrap: { width: 136 } });
    this.add([this.title, this.direction, this.target]);
  }

  public setTarget(navigation: { player: Point; target?: ObjectiveTarget } | undefined, i18n: I18nManager): this {
    this.title.setText(i18n.text('compass'));
    if (!navigation?.target) {
      this.direction.setText('T');
      this.target.setText(i18n.text('compassTerminal'));
      return this;
    }
    const distance = Phaser.Math.Distance.Between(navigation.player.x, navigation.player.y, navigation.target.point.x, navigation.target.point.y);
    this.direction.setText(directionArrow(navigation.player, navigation.target.point));
    this.target.setText(targetLabel(navigation.target.kind, i18n) + ' · ' + Math.max(1, Math.round(distance / 32)));
    return this;
  }
}
