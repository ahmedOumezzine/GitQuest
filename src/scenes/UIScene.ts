import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import type { GameSession } from '../core/GameSession';
import type { LevelDefinition } from '../models/game';
import { I18nManager } from '../managers/I18nManager';
import { InputManager } from '../phaser/InputManager';
import type { GitCommandResult } from '../systems/GitSimulator';
import { ResponsiveLayoutManager, type LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';
import { UITheme } from '../ui/theme/UITheme';

export class UIScene extends Phaser.Scene {
  private session!: GameSession;
  private level!: LevelDefinition;
  private world!: import('./WorldScene').WorldScene;
  private i18n!: I18nManager;
  private levelTitle!: Phaser.GameObjects.Text;
  private objective!: Phaser.GameObjects.Text;
  private stats!: Phaser.GameObjects.Text;
  private prompt!: Phaser.GameObjects.Text;
  private toast!: Phaser.GameObjects.Text;
  private inventoryPanel!: Phaser.GameObjects.Container;
  private journalPanel!: Phaser.GameObjects.Container;
  private journalText!: Phaser.GameObjects.Text;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private terminal!: Phaser.GameObjects.Container;
  private output!: Phaser.GameObjects.Text;
  private inputField!: Phaser.GameObjects.Text;
  private inputValue = '';
  private skipTerminalShortcutKey = false;
  private languageButtons: Phaser.GameObjects.Text[] = [];
  private journalButton!: Phaser.GameObjects.Text;
  private layout!: ResponsiveLayoutManager;
  private topBar!: Phaser.GameObjects.Rectangle;
  private xpTrack!: Phaser.GameObjects.Rectangle;
  private journalBackground!: Phaser.GameObjects.Rectangle;
  private terminalBackground!: Phaser.GameObjects.Rectangle;
  private terminalTitle!: Phaser.GameObjects.Text;
  private terminalPrompt!: Phaser.GameObjects.Text;
  private terminalHint!: Phaser.GameObjects.Text;
  private terminalClose!: Phaser.GameObjects.Text;
  private dialoguePanel!: Phaser.GameObjects.Container;
  private dialogueBackground!: Phaser.GameObjects.Rectangle;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueClose!: Phaser.GameObjects.Text;
  private touchInput?: InputManager;
  private commandHistory: string[] = [];
  private historyIndex = -1;

  public constructor() { super('UIScene'); }

  public create(): void {
    this.session = this.registry.get('session') as GameSession;
    this.i18n = new I18nManager(this.session.locale);
    this.layout = new ResponsiveLayoutManager(this);
    this.topBar = this.add.rectangle(0, 0, 960, 64, UITheme.colors.panel, 0.94).setOrigin(0).setDepth(20);
    this.levelTitle = this.add.text(18, 8, '', { fontFamily: UITheme.fontFamily, fontSize: '14px', color: '#f7d56a' }).setDepth(21);
    this.objective = this.add.text(18, 36, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: '#fff6df', wordWrap: { width: 520 } }).setDepth(21);
    this.stats = this.add.text(930, 8, '', { fontFamily: UITheme.fontFamily, fontSize: '13px', color: '#f7d56a', align: 'right' }).setOrigin(1, 0).setDepth(21);
    this.xpTrack = this.add.rectangle(575, 13, 105, 6, 0x354268).setOrigin(0, 0.5).setDepth(21);
    this.xpFill = this.add.rectangle(575, 13, 1, 6, 0xf7d56a).setOrigin(0, 0.5).setDepth(22);
    this.inventoryPanel = this.add.container(575, 33).setDepth(22);
    this.inventoryPanel.add(this.add.text(0, 0, '▣', { fontFamily: UITheme.fontFamily, fontSize: '16px', color: '#fff6df' }));
    this.prompt = this.add.text(480, 506, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: '#fff6df', backgroundColor: '#18233e', padding: { x: 8, y: 5 }, align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5).setDepth(30);
    this.toast = this.add.text(480, 92, '', { fontFamily: UITheme.fontFamily, fontSize: '15px', color: '#18233e', backgroundColor: '#f7d56a', padding: { x: 11, y: 7 }, align: 'center', wordWrap: { width: 700 } }).setOrigin(0.5).setDepth(40).setVisible(false);
    this.createLanguageButtons();
    this.createJournal();
    this.touchInput = new InputManager(this, () => undefined, () => EventBus.emit('terminal-open'), false);
    this.touchInput.setTouchMoveHandler((vector) => this.world?.setTouchVector(vector));
    if (this.session.shouldShowTouchControls()) {
      this.touchInput.bindTouch(
        [{ label: '◀', x: 68, y: 450, vector: { x: -1, y: 0 } }, { label: '▶', x: 178, y: 450, vector: { x: 1, y: 0 } }, { label: '▲', x: 123, y: 405, vector: { x: 0, y: -1 } }, { label: '▼', x: 123, y: 495, vector: { x: 0, y: 1 } }],
        () => this.world?.events.emit('touch-interact'),
      );
    }
    this.createTerminal();
    this.createDialoguePanel();
    this.layout.onResize((metrics) => this.applyLayout(metrics));
    EventBus.on('level-ready', ({ level }: { level: LevelDefinition }) => { this.level = level; this.world = this.scene.get('WorldScene') as import('./WorldScene').WorldScene; this.refresh(); });
    EventBus.on('nearby', (item: Phaser.GameObjects.GameObject | null) => this.prompt.setText(item ? this.i18n.text('interact') + ' · E' : this.i18n.text('controls')));
    EventBus.on('dialogue', ({ text }: { text: string }) => this.showDialogue(text));
    EventBus.on('toast', (text: string) => this.showToast(text));
    EventBus.on('terminal-open', () => {
      this.terminal.setVisible(true);
      this.inputValue = '';
      this.inputField.setText('');
      // La touche T qui ouvre le terminal est aussi reçue par le listener
      // générique ci-dessous. Elle ne doit pas devenir le premier caractère.
      this.skipTerminalShortcutKey = true;
    });
    EventBus.on('mission-update', () => this.refresh());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.removeAllListeners());
  }

  private createJournal(): void {
    this.journalButton = this.add.text(742, 35, 'J', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: '#fff6df', backgroundColor: '#354268', padding: { x: 10, y: 13 } }).setOrigin(0.5).setDepth(30).setInteractive();
    this.journalButton.on('pointerdown', () => this.journalPanel.setVisible(!this.journalPanel.visible));
    this.input.keyboard!.on('keydown-J', () => this.journalPanel.setVisible(!this.journalPanel.visible));
    this.journalPanel = this.add.container(590, 76).setDepth(45).setVisible(false);
    this.journalBackground = this.add.rectangle(0, 0, 330, 250, UITheme.colors.panel, 0.97).setOrigin(0).setStrokeStyle(3, UITheme.colors.borderAccent);
    this.journalPanel.add(this.journalBackground);
    this.journalPanel.add(this.add.text(18, 16, '', { fontFamily: UITheme.fontFamily, fontSize: '15px', color: '#f7d56a' }).setName('journal-title'));
    this.journalText = this.add.text(18, 52, '', { fontFamily: UITheme.fontFamily, fontSize: '13px', color: '#fff6df', lineSpacing: 8, wordWrap: { width: 290 } });
    this.journalPanel.add(this.journalText);
  }

  private createLanguageButtons(): void {
    (['fr', 'en', 'ar'] as const).forEach((locale, index) => {
      const button = this.add.text(805 + index * 42, 35, locale.toUpperCase(), { fontFamily: UITheme.fontFamily, fontSize: '11px', color: '#fff6df', backgroundColor: '#354268', padding: { x: 8, y: 13 }, align: 'center' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
      this.languageButtons.push(button);
      button.on('pointerdown', () => { this.session.locale = locale; this.i18n.locale = locale; this.session.save(); EventBus.emit('locale-changed', locale); this.refresh(); });
    });
  }

  private createTerminal(): void {
    this.terminal = this.add.container(120, 100).setDepth(50).setVisible(false);
    this.terminalBackground = this.add.rectangle(0, 0, 720, 330, UITheme.colors.panel, 0.98).setOrigin(0).setStrokeStyle(3, UITheme.colors.borderAccent);
    this.terminal.add(this.terminalBackground);
    this.terminalTitle = this.add.text(28, 18, '', { fontFamily: UITheme.fontFamily, fontSize: '13px', color: '#f7d56a' }).setName('terminal-title');
    this.terminal.add(this.terminalTitle);
    this.output = this.add.text(30, 52, '', { fontFamily: UITheme.fontFamily, fontSize: '14px', color: '#9ef0c1', wordWrap: { width: 660 } });
    this.terminal.add(this.output);
    this.terminalPrompt = this.add.text(30, 280, '> ', { fontFamily: UITheme.fontFamily, fontSize: '17px', color: '#f7d56a' });
    this.terminal.add(this.terminalPrompt);
    this.terminalHint = this.add.text(30, 308, '', { fontFamily: UITheme.fontFamily, fontSize: '11px', color: '#cbd5e1' });
    this.terminal.add(this.terminalHint);
    this.inputField = this.add.text(55, 280, '', { fontFamily: UITheme.fontFamily, fontSize: '17px', color: '#fff6df', backgroundColor: '#18233e', padding: { x: 5, y: 3 } });
    this.terminal.add(this.inputField);
    this.terminalClose = this.add.text(675, 18, '×', { fontFamily: UITheme.fontFamily, fontSize: '22px', color: '#fff6df', padding: { x: 10, y: 10 } }).setOrigin(0.5).setInteractive();
    this.terminalClose.on('pointerdown', () => { this.terminal.setVisible(false); EventBus.emit('terminal-close'); });
    this.terminal.add(this.terminalClose);
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (!this.terminal.visible) return;
      if (event.key === 'Escape') { this.terminal.setVisible(false); EventBus.emit('terminal-close'); return; }
      if (this.skipTerminalShortcutKey && event.key.toLowerCase() === 't') {
        this.skipTerminalShortcutKey = false;
        return;
      }
      if (event.key === 'Enter') this.runCommand();
      else if (event.key === 'ArrowUp') this.selectHistory(-1);
      else if (event.key === 'ArrowDown') this.selectHistory(1);
      else if (event.key === 'Backspace') this.inputValue = this.inputValue.slice(0, -1);
      else if (event.key.length === 1) this.inputValue += event.key;
      this.inputField.setText(this.inputValue);
    });
  }

  private createDialoguePanel(): void {
    this.dialoguePanel = this.add.container(0, 0).setDepth(60).setVisible(false);
    this.dialogueBackground = this.add.rectangle(0, 0, 720, 140, UITheme.colors.panel, 0.98).setOrigin(0).setStrokeStyle(3, UITheme.colors.borderAccent);
    this.dialogueText = this.add.text(120, 24, '', { fontFamily: UITheme.fontFamily, fontSize: '15px', color: UITheme.colors.text, wordWrap: { width: 545 }, lineSpacing: 7 });
    this.dialogueClose = this.add.text(680, 102, 'E / Enter', { fontFamily: UITheme.fontFamily, fontSize: '11px', color: UITheme.colors.accent }).setOrigin(1, 0);
    this.dialoguePanel.add([this.dialogueBackground, this.add.image(62, 70, 'midou').setDisplaySize(78, 78), this.dialogueText, this.dialogueClose]);
    this.input.keyboard!.on('keydown-ENTER', () => { if (this.dialoguePanel.visible) this.dialoguePanel.setVisible(false); });
    this.input.keyboard!.on('keydown-E', () => { if (this.dialoguePanel.visible) this.dialoguePanel.setVisible(false); });
    this.dialoguePanel.setInteractive(new Phaser.Geom.Rectangle(0, 0, 720, 140), Phaser.Geom.Rectangle.Contains).on('pointerdown', () => this.dialoguePanel.setVisible(false));
  }

  private runCommand(): void {
    const entered = this.inputValue.trim();
    if (!entered) return;
    if (entered === 'git help' || entered === 'help') {
      this.output.setText((this.output.text + '\n$ ' + entered + '\n' + this.i18n.text('terminalHelp')).slice(-1700));
      this.inputValue = '';
      this.historyIndex = -1;
      this.inputField.setText('');
      return;
    }
    this.commandHistory = [...this.commandHistory.filter((item) => item !== entered), entered].slice(-20);
    this.historyIndex = -1;
    const result: GitCommandResult = this.session.git.execute(entered);
    const quest = this.world?.activeQuest;
    if (quest && result.operation) {
      const accepted = quest.acceptGit(result, result.operation);
      if (accepted) this.session.save();
      this.refresh();
    }
    this.output.setText((this.output.text + '\n' + (result.ok ? '$ ' : '! ') + entered + '\n' + this.i18n.gitMessage(result.message)).slice(-1700));
    this.inputValue = '';
    this.inputField.setText('');
    this.session.save();
  }

  private selectHistory(direction: -1 | 1): void {
    if (!this.commandHistory.length) {
      this.showToast(this.i18n.text('terminalHistoryEmpty'));
      return;
    }
    this.historyIndex = Math.max(-1, Math.min(this.commandHistory.length - 1, this.historyIndex + direction));
    this.inputValue = this.historyIndex < 0 ? '' : this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    this.inputField.setText(this.inputValue);
  }

  private showDialogue(text: string): void {
    this.dialogueText.setText(text);
    this.dialoguePanel.setVisible(true);
  }

  private showToast(text: string, duration = 2600): void { this.toast.setText(text).setVisible(true); this.time.delayedCall(duration, () => this.toast.setVisible(false)); }
  private refresh(): void {
    if (!this.world || !this.level) return;
    this.i18n.locale = this.session.locale;
    const rtl = this.i18n.direction === 'rtl';
    this.levelTitle.setOrigin(rtl ? 1 : 0, 0);
    this.objective.setOrigin(rtl ? 1 : 0, 0).setStyle({ align: rtl ? 'right' : 'left' });
    this.stats.setOrigin(rtl ? 0 : 1, 0).setStyle({ align: rtl ? 'left' : 'right' });
    const quest = this.world.activeQuest;
    const step = quest?.currentStep;
    this.levelTitle.setText(this.i18n.localized(this.level.title));
    this.objective.setText(this.i18n.text('objective') + ' : ' + this.i18n.localized(this.level.quest.title) + ' · ' + (step ? this.i18n.stepLabel(step.id) : this.i18n.text('missionDone')));
    this.stats.setText(this.i18n.text('xp') + ': ' + this.session.xp.value);
    this.xpFill.setDisplaySize(Math.max(1, Math.min(110, (this.session.xp.value % 100) * 1.1)), 8);
    this.inventoryPanel.removeAll(true);
    this.inventoryPanel.add(this.add.text(0, 0, '▣', { fontFamily: 'monospace', fontSize: '16px', color: '#fff6df' }));
    this.session.inventory.list().forEach((item, index) => this.inventoryPanel.add(this.add.image(24 + index * 28, 8, item === 'pass-key' ? 'key' : 'chest').setDisplaySize(22, 22)));
    this.journalText?.setText(this.level.quest.steps.map((step) => (quest.hasCompleted(step.id) ? '✓ ' : '○ ') + this.i18n.stepLabel(step.id)).join('\n'));
    const journalTitle = this.journalPanel?.getByName('journal-title') as Phaser.GameObjects.Text | undefined;
    journalTitle?.setText(this.i18n.text('journal'));
    const terminalTitle = this.terminal?.getByName('terminal-title') as Phaser.GameObjects.Text | undefined;
    terminalTitle?.setText(this.i18n.text('terminalTitle'));
    this.terminalHint?.setText(this.i18n.text('terminalHelp'));
    if (this.output && !this.output.text.includes('\n$ ') && !this.output.text.includes('\n! ')) this.output.setText(this.i18n.text('terminalWelcome') + '\n');
    // Phaser conserve ses coordonnées de scène, mais la surface doit exposer
    // la direction active aux lecteurs et aux outils d’intégration.
    this.game.canvas?.setAttribute('dir', this.i18n.direction);
    this.applyLayout(this.layout.current);
  }

  private applyLayout(metrics: LayoutMetrics): void {
    const rtl = this.i18n?.direction === 'rtl';
    const margin = metrics.margin;
    this.topBar.setSize(metrics.width, metrics.topBarHeight);
    const sideWidth = Math.min(250, Math.max(140, metrics.width * 0.27));
    const textX = rtl ? metrics.width - margin : margin;
    const statsX = rtl ? margin : metrics.width - margin;
    this.levelTitle.setPosition(textX, 8).setOrigin(rtl ? 1 : 0, 0);
    this.objective.setPosition(textX, 36).setOrigin(rtl ? 1 : 0, 0).setWordWrapWidth(Math.max(160, metrics.width - sideWidth - margin * 3));
    this.stats.setPosition(statsX, 8).setOrigin(rtl ? 0 : 1, 0);
    const xpWidth = Math.min(140, Math.max(70, metrics.width * 0.14));
    const xpX = rtl ? margin : metrics.width - margin - sideWidth - xpWidth;
    this.xpTrack.setPosition(xpX, metrics.compact ? 18 : 13).setSize(xpWidth, 6);
    this.xpFill.setPosition(xpX, metrics.compact ? 18 : 13);
    this.inventoryPanel.setPosition(xpX, metrics.compact ? 38 : 33);
    const buttonY = metrics.portrait ? metrics.topBarHeight - 24 : metrics.compact ? metrics.topBarHeight - 24 : 35;
    const languageWidth = 38;
    const languageGap = 6;
    const languageTotal = this.languageButtons.length * languageWidth + (this.languageButtons.length - 1) * languageGap;
    const languageStart = rtl ? metrics.width - margin - languageTotal : metrics.width - margin - languageTotal;
    this.languageButtons.forEach((button, index) => {
      button.setPosition(languageStart + languageWidth / 2 + index * (languageWidth + languageGap), buttonY);
    });
    this.journalButton?.setPosition(rtl ? margin + 24 : languageStart - 34, buttonY);
    this.prompt.setPosition(metrics.width / 2, metrics.height - margin - 18).setWordWrapWidth(Math.max(160, metrics.width - margin * 2));
    this.toast.setPosition(metrics.width / 2, metrics.topBarHeight + 24).setWordWrapWidth(Math.max(180, metrics.width - margin * 2));
    const journalWidth = Math.min(360, metrics.width - margin * 2);
    const journalHeight = Math.min(250, Math.max(160, metrics.height - metrics.topBarHeight - margin * 2));
    const journalX = rtl ? margin : metrics.width - margin - journalWidth;
    this.journalPanel?.setPosition(journalX, metrics.topBarHeight + margin);
    this.journalBackground?.setSize(journalWidth, journalHeight);
    const journalTitle = this.journalPanel?.getByName('journal-title') as Phaser.GameObjects.Text | undefined;
    journalTitle?.setPosition(rtl ? journalWidth - 18 : 18, 16).setOrigin(rtl ? 1 : 0, 0);
    this.journalText?.setPosition(rtl ? journalWidth - 18 : 18, 52).setOrigin(rtl ? 1 : 0, 0).setWordWrapWidth(journalWidth - 36).setStyle({ align: rtl ? 'right' : 'left' });
    const terminalWidth = Math.min(720, metrics.width - margin * 2);
    const terminalHeight = Math.min(330, Math.max(250, metrics.height - metrics.topBarHeight - margin * 2));
    const terminalX = (metrics.width - terminalWidth) / 2;
    const terminalY = metrics.topBarHeight + Math.max(margin, (metrics.height - metrics.topBarHeight - terminalHeight) / 2);
    this.terminal?.setPosition(terminalX, terminalY);
    this.terminalBackground?.setSize(terminalWidth, terminalHeight);
    this.terminalTitle?.setPosition(28, 18);
    this.terminalClose?.setPosition(terminalWidth - 28, 18);
    this.output?.setPosition(30, 52).setWordWrapWidth(Math.max(150, terminalWidth - 60));
    this.terminalPrompt?.setPosition(30, terminalHeight - 50);
    this.inputField?.setPosition(55, terminalHeight - 50);
    this.terminalHint?.setPosition(30, terminalHeight - 22).setWordWrapWidth(Math.max(150, terminalWidth - 60));
    this.touchInput?.layoutTouch(metrics);
    const dialogueWidth = Math.min(760, metrics.width - margin * 2);
    const dialogueHeight = metrics.compact ? 122 : 140;
    const dialogueX = (metrics.width - dialogueWidth) / 2;
    const dialogueY = metrics.height - margin - dialogueHeight - 34;
    this.dialoguePanel?.setPosition(dialogueX, dialogueY);
    this.dialogueBackground?.setSize(dialogueWidth, dialogueHeight);
    this.dialogueText?.setPosition(rtl ? dialogueWidth - 120 : 120, 20).setWordWrapWidth(Math.max(160, dialogueWidth - 145)).setStyle({ align: rtl ? 'right' : 'left' });
    this.dialogueClose?.setPosition(dialogueWidth - 18, dialogueHeight - 28);
  }
}
