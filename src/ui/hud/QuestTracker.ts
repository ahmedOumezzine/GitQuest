import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import type { LevelDefinition } from '../../models/game';
import type { QuestManager } from '../../managers/QuestManager';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

export class QuestTracker extends ResponsivePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly objective: Phaser.GameObjects.Text;
  private readonly progress: Phaser.GameObjects.Text;
  private expanded = false;

  public constructor(scene: Phaser.Scene) {
    super(scene, 360, 70, { fillColor: UITheme.colors.panel, fillAlpha: 0.92, borderWidth: 2 });
    this.title = scene.add.text(14, 10, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.accent, stroke: '#10172b', strokeThickness: 1 });
    this.objective = scene.add.text(14, 32, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.text, wordWrap: { width: 332 } });
    this.progress = scene.add.text(14, 55, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.textMuted });
    this.add([this.title, this.objective, this.progress]);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 330, 66), Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.toggle());
  }

  public setQuest(level: LevelDefinition, quest: QuestManager, i18n: I18nManager, width: number, compact: boolean): this {
    const current = quest.currentStep;
    const completed = level.quest.steps.filter((step) => quest.hasCompleted(step.id)).length;
    const total = level.quest.steps.length;
    const title = i18n.localized(level.quest.title);
    const action = current ? i18n.stepLabel(current.id) : i18n.text('missionDone');
    const compactCollapsed = compact && !this.expanded;
    this.setPanelSize(Math.min(380, Math.max(220, width)), compactCollapsed ? 60 : 70);
    this.title.setText(`${i18n.text('objective')} · ${title}`).setFontSize(compact ? '10px' : '12px');
    this.objective.setText(action).setFontSize(compact ? '11px' : '12px').setPosition(14, compactCollapsed ? 28 : 32).setWordWrapWidth(Math.max(150, this.panelWidth - 24));
    this.progress.setText(`${completed}/${total}`).setY(compactCollapsed ? 46 : 55);
    return this;
  }

  public toggle(): this { this.expanded = !this.expanded; return this; }
}
