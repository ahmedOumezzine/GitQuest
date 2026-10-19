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
  private compact = false;
  private portrait = false;
  private currentTitle = '';
  private currentAction = '';
  private currentGuidance = '';
  private currentProgress = '';

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
    const action = current ? i18n.stepLabel(current.id) : i18n.text('missionDone');
    // Reset the presentation only when crossing a responsive breakpoint. A
    // player can therefore expand the mission card without the next refresh
    // immediately collapsing it again.
    if (this.compact !== compact || this.portrait !== portrait) this.expanded = !compact;
    this.compact = compact;
    this.portrait = portrait;
    this.currentTitle = `${i18n.text('objective')} · ${i18n.localized(level.quest.title)}`;
    this.currentAction = '▶ ' + action;
    const rtl = i18n.direction === 'rtl';
    const studiedCommand = level.gitCommands[0] ? i18n.gitCommand(level.gitCommands[0]) : '';
    this.currentGuidance = '› ' + i18n.objectiveGuidance(current);
    this.currentProgress = studiedCommand
      ? `${completed}/${total} · ${i18n.text('studied')}: ${studiedCommand}`
      : `${completed}/${total}`;
    const maxWidth = compact && !portrait ? 520 : 380;
    this.setPanelSize(Math.min(maxWidth, Math.max(220, width)), this.panelHeightForMode());
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.panelWidth, this.panelHeight), Phaser.Geom.Rectangle.Contains);
    const textX = rtl ? this.panelWidth - 14 : 14;
    const originX = rtl ? 1 : 0;
    const align = rtl ? 'right' : 'left';
    const titleSize = portrait ? '10px' : compact ? '10px' : '12px';
    const actionSize = portrait ? '11px' : compact ? '11px' : '12px';
    this.title.setText(this.currentTitle).setFontSize(titleSize).setOrigin(originX, 0).setStyle({ align });
    this.objective.setText(this.currentAction).setFontSize(actionSize).setOrigin(originX, 0).setStyle({ align }).setWordWrapWidth(Math.max(150, this.panelWidth - 24));
    this.guidance.setText(this.currentGuidance).setFontSize(portrait ? '8px' : compact ? '9px' : '10px').setOrigin(originX, 0).setStyle({ align }).setWordWrapWidth(Math.max(150, this.panelWidth - 24)).setMaxLines(portrait ? 1 : undefined);
    this.progress.setText(this.currentProgress).setFontSize(portrait ? '8px' : '10px').setOrigin(originX, 0).setStyle({ align });
    this.layoutText(textX, originX, align);
    return this;
  }

  public toggle(): this {
    this.expanded = !this.expanded;
    this.setPanelSize(this.panelWidth, this.panelHeightForMode());
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.panelWidth, this.panelHeight), Phaser.Geom.Rectangle.Contains);
    const rtl = this.title.originX === 1;
    this.layoutText(rtl ? this.panelWidth - 14 : 14, rtl ? 1 : 0, rtl ? 'right' : 'left');
    return this;
  }

  private panelHeightForMode(): number {
    if (!this.compact) return 96;
    if (!this.expanded) return this.portrait ? 58 : 60;
    return this.portrait ? 96 : 88;
  }

  private layoutText(textX: number, originX: number, align: 'left' | 'right'): void {
    const collapsed = this.compact && !this.expanded;
    this.title.setPosition(textX, this.portrait ? 7 : 9);
    this.objective.setPosition(textX, this.portrait ? 29 : 30);
    this.guidance.setPosition(textX, this.portrait ? 49 : 54);
    this.progress.setPosition(textX, this.portrait ? 76 : 78);
    this.title.setOrigin(originX, 0).setStyle({ align });
    this.objective.setOrigin(originX, 0).setStyle({ align });
    this.guidance.setOrigin(originX, 0).setStyle({ align });
    this.progress.setOrigin(originX, 0).setStyle({ align });
    this.guidance.setVisible(!collapsed);
    this.progress.setVisible(!collapsed);
    // The compact title carries the progress count so the collapsed card
    // still communicates the state in its two permanent lines.
    const titleText = collapsed && this.currentProgress
      ? `${this.currentTitle} · ${this.currentProgress.split(' · ')[0]}`
      : this.currentTitle;
    this.title.setText(titleText);
  }
}
