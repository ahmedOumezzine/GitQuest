import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import type { LevelDefinition } from '../../models/game';
import type { QuestManager } from '../../managers/QuestManager';
import { ResponsivePanel } from './ResponsivePanel';
import { UITheme } from '../theme/UITheme';

export class QuestTracker extends ResponsivePanel {
  private readonly title: Phaser.GameObjects.Text;
  private readonly objective: Phaser.GameObjects.Text;
  private readonly guidance: Phaser.GameObjects.Text;
  private readonly progress: Phaser.GameObjects.Text;
  private expanded = false;

  public constructor(scene: Phaser.Scene) {
    super(scene, 360, 98, { fillColor: UITheme.colors.panel, fillAlpha: 0.92, borderWidth: 2 });
    this.title = scene.add.text(14, 10, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.accent, stroke: '#10172b', strokeThickness: 1 });
    this.objective = scene.add.text(14, 32, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.text, wordWrap: { width: 332 } });
    this.guidance = scene.add.text(14, 55, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.success, wordWrap: { width: 332 }, lineSpacing: 2 });
    this.progress = scene.add.text(14, 82, '', { fontFamily: UITheme.fontFamily, fontSize: '10px', color: UITheme.colors.textMuted });
    this.add([this.title, this.objective, this.guidance, this.progress]);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 380, 98), Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.toggle());
  }

  public setQuest(level: LevelDefinition, quest: QuestManager, i18n: I18nManager, width: number, compact: boolean, portrait = false): this {
    const current = quest.currentStep;
    const completed = level.quest.steps.filter((step) => quest.hasCompleted(step.id)).length;
    const total = level.quest.steps.length;
    const title = i18n.localized(level.quest.title);
    const action = current ? i18n.stepLabel(current.id) : i18n.text('missionDone');
    const compactCollapsed = compact && !this.expanded;
    const panelHeight = portrait ? 76 : compactCollapsed ? 88 : 98;
    this.setPanelSize(Math.min(380, Math.max(220, width)), panelHeight);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.panelWidth, panelHeight), Phaser.Geom.Rectangle.Contains);
    const rtl = i18n.direction === 'rtl';
    const textX = rtl ? this.panelWidth - 14 : 14;
    const originX = rtl ? 1 : 0;
    const align = rtl ? 'right' : 'left';
    this.title.setText(`${i18n.text('objective')} · ${title}`).setFontSize(portrait ? '9px' : compact ? '10px' : '12px').setPosition(textX, portrait ? 7 : 10).setOrigin(originX, 0).setStyle({ align });
    this.objective.setText('▶ ' + action).setFontSize(portrait ? '10px' : compact ? '11px' : '12px').setPosition(textX, portrait ? 26 : 32).setOrigin(originX, 0).setStyle({ align }).setWordWrapWidth(Math.max(150, this.panelWidth - 24));
    this.guidance.setText('› ' + i18n.objectiveGuidance(current)).setFontSize(portrait ? '8px' : compact ? '9px' : '10px').setPosition(textX, portrait ? 45 : compactCollapsed ? 53 : 55).setOrigin(originX, 0).setStyle({ align }).setWordWrapWidth(Math.max(150, this.panelWidth - 24)).setMaxLines(portrait ? 1 : undefined);
    this.progress.setText(`${completed}/${total}`).setPosition(textX, portrait ? 64 : compactCollapsed ? 76 : 82).setOrigin(originX, 0).setStyle({ align });
    return this;
  }

  public toggle(): this { this.expanded = !this.expanded; return this; }
}
