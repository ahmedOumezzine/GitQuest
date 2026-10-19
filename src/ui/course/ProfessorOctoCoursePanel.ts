import Phaser from 'phaser';
import type { I18nManager } from '../../managers/I18nManager';
import type { LayoutMetrics } from '../layout/ResponsiveLayoutManager';
import { UITheme } from '../theme/UITheme';
import { getProfessorOctoCoursePages, professorOctoCourseTitleKey, type ProfessorOctoCoursePage } from './ProfessorOctoCourseContent';
import { getProfessorOctoQuizQuestions, hasProfessorOctoQuiz, professorOctoQuizResultKey } from './ProfessorOctoQuizContent';
import { ProfessorOctoQuizSession, type ProfessorOctoQuizAnswerResult } from './ProfessorOctoQuizLogic';

export type ProfessorOctoCourseCloseReason = 'close' | 'practice';
type CourseCloseHandler = (reason: ProfessorOctoCourseCloseReason) => void;
type CourseView = 'course' | 'quiz' | 'result';

/** A focused, reusable RPG lesson window for Professor Octo. */
export class ProfessorOctoCoursePanel extends Phaser.GameObjects.Container {
  private readonly i18n: I18nManager;
  private readonly onClose: CourseCloseHandler;
  private readonly blocker: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly header: Phaser.GameObjects.Rectangle;
  private readonly portraitFrame: Phaser.GameObjects.Rectangle;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly professorName: Phaser.GameObjects.Text;
  private readonly lessonTitle: Phaser.GameObjects.Text;
  private readonly pageTitle: Phaser.GameObjects.Text;
  private readonly pageText: Phaser.GameObjects.Text;
  private readonly commandLabel: Phaser.GameObjects.Text;
  private readonly commandBlock: Phaser.GameObjects.Rectangle;
  private readonly commandText: Phaser.GameObjects.Text;
  private readonly stepsText: Phaser.GameObjects.Text;
  private readonly resultLabel: Phaser.GameObjects.Text;
  private readonly resultBlock: Phaser.GameObjects.Rectangle;
  private readonly resultText: Phaser.GameObjects.Text;
  private readonly quizButton: Phaser.GameObjects.Text;
  private readonly quizAnswerButtons: Phaser.GameObjects.Text[];
  private readonly quizFeedback: Phaser.GameObjects.Text;
  private readonly quizPracticeButton: Phaser.GameObjects.Text;
  private readonly quizPracticeHitTarget: Phaser.GameObjects.Rectangle;
  private readonly progress: Phaser.GameObjects.Text;
  private readonly previousButton: Phaser.GameObjects.Text;
  private readonly nextButton: Phaser.GameObjects.Text;
  private readonly close: Phaser.GameObjects.Text;
  private readonly divider: Phaser.GameObjects.Rectangle;
  private pageIndex = 0;
  private pages: ProfessorOctoCoursePage[] = [];
  private levelId = 'level-01';
  private quizEnabled = true;
  private panelWidth = 760;
  private panelHeight = 370;
  private portraitLayout = false;
  private rtl = false;
  private view: CourseView = 'course';
  private quiz?: ProfessorOctoQuizSession;
  private quizSelection = 0;
  private quizAnswer?: ProfessorOctoQuizAnswerResult;

  public constructor(scene: Phaser.Scene, i18n: I18nManager, onClose: CourseCloseHandler) {
    super(scene, 0, 0);
    this.i18n = i18n;
    this.onClose = onClose;
    this.setDepth(60).setVisible(false);

    this.blocker = scene.add.rectangle(0, 0, 1, 1, UITheme.colors.panelShadow, 0.02)
      .setOrigin(0)
      .setInteractive();
    this.blocker.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation();
      // Some mobile browsers hit the full-screen blocker before a transparent
      // child target. Keep the practice action reachable without changing the
      // visual layout or allowing the last quiz tap to fall through.
      if (this.view === 'result' && this.quizPracticeHitTarget.visible && this.quizPracticeHitTarget.getBounds().contains(pointer.worldX, pointer.worldY)) {
        this.handlePracticeButton();
      }
    });

    this.panel = scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, UITheme.colors.panel, 0.99)
      .setOrigin(0)
      .setStrokeStyle(4, UITheme.colors.borderAccent);
    this.header = scene.add.rectangle(4, 4, this.panelWidth - 8, 52, UITheme.colors.panelRaised, 1).setOrigin(0);
    this.portraitFrame = scene.add.rectangle(20, 78, 176, 206, UITheme.colors.panelRaised, 1)
      .setOrigin(0)
      .setStrokeStyle(2, UITheme.colors.panelLine);
    this.portrait = scene.add.image(108, 175, 'professor-octo-portrait-v1').setDisplaySize(150, 150);
    this.professorName = scene.add.text(108, 267, '', {
      fontFamily: UITheme.fontFamily, fontSize: '13px', color: UITheme.colors.accent,
      align: 'center', wordWrap: { width: 160 },
    }).setOrigin(0.5, 0);
    this.lessonTitle = scene.add.text(220, 18, '', {
      fontFamily: UITheme.fontFamily, fontSize: '18px', color: UITheme.colors.accent,
      stroke: UITheme.colors.panelShadow.toString(16), strokeThickness: 2,
    });
    this.progress = scene.add.text(this.panelWidth - 20, 20, '', {
      fontFamily: UITheme.fontFamily, fontSize: '13px', color: UITheme.colors.textMuted,
    }).setOrigin(1, 0);
    this.close = this.makeButton(scene, '', 0, 0, UITheme.colors.button, 12);
    this.pageTitle = scene.add.text(220, 88, '', {
      fontFamily: UITheme.fontFamily, fontSize: '20px', color: UITheme.colors.text,
      stroke: UITheme.colors.panelShadow.toString(16), strokeThickness: 2,
    });
    this.divider = scene.add.rectangle(220, 126, 500, 2, UITheme.colors.panelLine).setOrigin(0);
    this.pageText = scene.add.text(220, 148, '', {
      fontFamily: UITheme.fontFamily, fontSize: '16px', color: UITheme.colors.text,
      lineSpacing: 8, wordWrap: { width: 500 },
    });
    this.commandLabel = scene.add.text(220, 206, '', {
      fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.accent,
    }).setVisible(false);
    this.commandBlock = scene.add.rectangle(220, 226, 500, 46, UITheme.colors.panelRaised, 1)
      .setOrigin(0).setStrokeStyle(2, UITheme.colors.borderAccent).setVisible(false);
    this.commandText = scene.add.text(470, 249, 'git init', {
      fontFamily: UITheme.fontFamily, fontSize: '19px', color: UITheme.colors.text,
      backgroundColor: '#273e68', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setVisible(false);
    this.stepsText = scene.add.text(220, 198, '', {
      fontFamily: UITheme.fontFamily, fontSize: '14px', color: UITheme.colors.text,
      lineSpacing: 4, wordWrap: { width: 500 },
    }).setVisible(false);
    this.resultLabel = scene.add.text(220, 274, '', {
      fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.accent,
    }).setVisible(false);
    this.resultBlock = scene.add.rectangle(220, 292, 500, 50, UITheme.colors.panelRaised, 1)
      .setOrigin(0).setStrokeStyle(2, UITheme.colors.panelLine).setVisible(false);
    this.resultText = scene.add.text(236, 301, '', {
      fontFamily: UITheme.fontFamily, fontSize: '12px', color: UITheme.colors.text,
      lineSpacing: 3, wordWrap: { width: 468 },
    }).setVisible(false);
    this.previousButton = this.makeButton(scene, '', 0, 0, UITheme.colors.button, 13);
    this.nextButton = this.makeButton(scene, '', 0, 0, UITheme.colors.button, 13);
    this.quizButton = this.makeButton(scene, '', 0, 0, UITheme.colors.button, 12).setVisible(false);
    this.quizPracticeButton = this.makeButton(scene, '', 0, 0, UITheme.colors.button, 12).setVisible(false);
    this.quizPracticeHitTarget = scene.add.rectangle(0, 0, 220, 54, 0x000000, 0)
      .setOrigin(0.5).setVisible(false).setInteractive();
    this.quizAnswerButtons = [0, 1, 2].map(() => this.makeButton(scene, '', 0, 0, UITheme.colors.button, 12).setVisible(false));
    this.quizFeedback = scene.add.text(220, 330, '', {
      fontFamily: UITheme.fontFamily, fontSize: '13px', color: UITheme.colors.text,
      lineSpacing: 4, wordWrap: { width: 500 },
    }).setVisible(false);

    this.add([this.blocker, this.panel, this.header, this.portraitFrame, this.portrait, this.professorName,
      this.lessonTitle, this.progress, this.close, this.pageTitle, this.divider, this.pageText,
      this.commandLabel, this.commandBlock, this.commandText, this.stepsText, this.resultLabel,
      this.resultBlock, this.resultText, this.quizButton, ...this.quizAnswerButtons, this.quizFeedback,
      this.quizPracticeButton, this.previousButton, this.nextButton, this.quizPracticeHitTarget]);

    this.close.on('pointerdown', () => this.onClose('close'));
    this.quizButton.on('pointerdown', () => this.openQuiz());
    this.quizPracticeButton.on('pointerdown', this.handlePracticeButton, this);
    this.quizPracticeHitTarget.on('pointerdown', this.handlePracticeButton, this);
    this.quizAnswerButtons.forEach((button, index) => button.on('pointerdown', () => this.answerQuiz(index)));
    this.previousButton.on('pointerdown', () => this.handlePreviousAction());
    this.nextButton.on('pointerdown', () => this.handleNextAction());
    scene.input.keyboard?.on('keydown-ESC', this.handleEscape, this);
    scene.input.keyboard?.on('keydown-LEFT', this.handlePreviousAction, this);
    scene.input.keyboard?.on('keydown-RIGHT', this.handleNextAction, this);
    scene.input.keyboard?.on('keydown-ENTER', this.handleEnter, this);
    scene.input.keyboard?.on('keydown-UP', this.moveQuizSelectionUp, this);
    scene.input.keyboard?.on('keydown-DOWN', this.moveQuizSelectionDown, this);
    scene.input.keyboard?.on('keydown-A', () => this.answerQuiz(0), this);
    scene.input.keyboard?.on('keydown-B', () => this.answerQuiz(1), this);
    scene.input.keyboard?.on('keydown-C', () => this.answerQuiz(2), this);
    scene.input.keyboard?.on('keydown-Q', this.handleQuizShortcut, this);
    scene.input.keyboard?.on('keydown-P', this.handlePracticeShortcut, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.refreshLocale();
  }

  public override destroy(fromScene?: boolean): void {
    this.scene.input.keyboard?.off('keydown-ESC', this.handleEscape, this);
    this.scene.input.keyboard?.off('keydown-LEFT', this.handlePreviousAction, this);
    this.scene.input.keyboard?.off('keydown-RIGHT', this.handleNextAction, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.handleEnter, this);
    this.scene.input.keyboard?.off('keydown-UP', this.moveQuizSelectionUp, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.moveQuizSelectionDown, this);
    this.scene.input.keyboard?.off('keydown-Q', this.handleQuizShortcut, this);
    this.scene.input.keyboard?.off('keydown-P', this.handlePracticeShortcut, this);
    super.destroy(fromScene);
  }

  public show(): void {
    this.view = 'course';
    this.quiz = undefined;
    this.quizAnswer = undefined;
    this.quizSelection = 0;
    this.pageIndex = 0;
    this.pages = getProfessorOctoCoursePages(this.i18n, this.levelId);
    this.layoutForCurrentViewport();
    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
    if (typeof document !== 'undefined') delete document.documentElement.dataset.gitquestCourseView;
  }

  public refreshLocale(): void {
    this.rtl = this.i18n.direction === 'rtl';
    this.pages = getProfessorOctoCoursePages(this.i18n, this.levelId);
    this.lessonTitle.setText(this.i18n.text(professorOctoCourseTitleKey(this.levelId)));
    this.professorName.setText(this.i18n.text('professorOctoName'));
    this.commandLabel.setText(this.i18n.text('courseCommandLabel'));
    this.resultLabel.setText(this.i18n.text('courseExampleLabel'));
    this.close.setText(this.i18n.text('courseClose'));
    this.quizButton.setText(this.i18n.text('quizOpen'));
    this.quizPracticeButton.setText(this.i18n.text('quizPractice'));
    this.refreshView();
    this.layoutForCurrentViewport();
  }

  public setLevel(levelId: string): void {
    this.levelId = levelId;
    this.quizEnabled = hasProfessorOctoQuiz(levelId);
    this.pages = getProfessorOctoCoursePages(this.i18n, levelId);
    this.lessonTitle.setText(this.i18n.text(professorOctoCourseTitleKey(levelId)));
    if (this.visible) {
      this.pageIndex = 0;
      this.view = 'course';
      this.quiz = undefined;
      this.quizAnswer = undefined;
      this.layoutForCurrentViewport();
    }
  }

  public layout(metrics: LayoutMetrics): void {
    if (typeof document !== 'undefined') document.documentElement.dataset.gitquestCourseView = this.view;
    this.panelWidth = metrics.portrait
      ? Math.min(366, metrics.width - metrics.margin * 2)
      : metrics.compact
        ? Math.min(760, metrics.width - metrics.margin * 2)
        : Math.min(820, metrics.width - metrics.margin * 2);
    const densePage = Boolean(this.pages[this.pageIndex]?.steps);
    const contentHeavyPage = this.view === 'course' && (this.levelId === 'level-02' || this.levelId === 'level-04') && this.pageIndex >= 1 && this.pageIndex <= 4;
    const pageFive = contentHeavyPage && this.pageIndex === 4;
    const quizView = this.view !== 'course';
    this.panelHeight = metrics.portrait
      ? Math.min(pageFive ? 760 : contentHeavyPage ? 680 : 600, metrics.height - 24)
      : metrics.compact
        ? Math.min(contentHeavyPage ? 360 : quizView || densePage ? 340 : 300, metrics.height - 24)
        : pageFive ? 570 : contentHeavyPage ? 500 : quizView || densePage ? 410 : 370;
    this.portraitLayout = metrics.portrait;
    this.panel.setSize(this.panelWidth, this.panelHeight);
    this.header.setSize(Math.max(1, this.panelWidth - 8), metrics.portrait ? 54 : 52);
    this.blocker.setSize(metrics.width, metrics.height);
    this.setPosition((metrics.width - this.panelWidth) / 2, Math.max(metrics.margin, (metrics.height - this.panelHeight) / 2));

    if (metrics.portrait) {
      const centerX = this.panelWidth / 2;
      this.portraitFrame.setPosition(18, 72).setSize(this.panelWidth - 36, 126);
      this.portrait.setPosition(centerX, 135).setDisplaySize(108, 108);
      this.professorName.setPosition(centerX, 182).setWordWrapWidth(this.panelWidth - 50).setFontSize('12px');
      this.lessonTitle.setPosition(this.rtl ? this.panelWidth - 18 : 18, 16).setOrigin(this.rtl ? 1 : 0, 0).setFontSize('15px').setWordWrapWidth(this.panelWidth - 100);
      this.progress.setPosition(this.rtl ? 18 : this.panelWidth - 18, 20).setOrigin(this.rtl ? 0 : 1, 0);
      this.pageTitle.setPosition(this.rtl ? this.panelWidth - 18 : 18, 224).setOrigin(this.rtl ? 1 : 0, 0).setFontSize('17px').setWordWrapWidth(this.panelWidth - 36).setStyle({ align: this.rtl ? 'right' : 'left' });
      this.divider.setPosition(18, 267).setSize(this.panelWidth - 36, 2);
      this.pageText.setPosition(this.rtl ? this.panelWidth - 18 : 18, 284).setOrigin(this.rtl ? 1 : 0, 0).setFontSize('14px').setWordWrapWidth(this.panelWidth - 36).setStyle({ align: this.rtl ? 'right' : 'left' });
      this.commandLabel.setPosition(this.rtl ? this.panelWidth - 18 : 18, 372).setOrigin(this.rtl ? 1 : 0, 0).setVisible(false);
      this.commandBlock.setPosition(18, 391).setSize(this.panelWidth - 36, 46).setVisible(false);
      this.commandText.setPosition(this.panelWidth / 2, 414).setVisible(false);
      this.stepsText.setPosition(this.rtl ? this.panelWidth - 18 : 18, 352).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(this.panelWidth - 36).setFontSize('13px').setStyle({ align: this.rtl ? 'right' : 'left' }).setVisible(false);
      this.resultLabel.setPosition(this.rtl ? this.panelWidth - 18 : 18, 472).setOrigin(this.rtl ? 1 : 0, 0).setVisible(false);
      this.resultBlock.setPosition(18, 491).setSize(this.panelWidth - 36, 54).setVisible(false);
      this.resultText.setPosition(this.rtl ? this.panelWidth - 32 : 32, 500).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(this.panelWidth - 64).setStyle({ align: this.rtl ? 'right' : 'left' }).setVisible(false);
      const portraitNavY = densePage ? this.panelHeight - 38 : this.panelHeight - 52;
      this.previousButton.setPosition(this.rtl ? this.panelWidth - 18 : 18, portraitNavY).setOrigin(this.rtl ? 1 : 0, 0.5);
      this.nextButton.setPosition(this.rtl ? 18 : this.panelWidth - 18, portraitNavY).setOrigin(this.rtl ? 0 : 1, 0.5);
      this.close.setPosition(this.panelWidth / 2, this.panelHeight - 2).setOrigin(0.5, 1);
      this.quizButton.setPosition(centerX, this.panelHeight - 105).setOrigin(0.5, 0.5);
      this.quizPracticeButton.setPosition(centerX, this.panelHeight - 60).setOrigin(0.5, 0.5);
      this.quizPracticeHitTarget.setPosition(centerX, this.panelHeight - 60).setSize(Math.min(this.panelWidth - 36, 260), 56);
      this.quizFeedback.setPosition(this.rtl ? this.panelWidth - 18 : 18, 480).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(this.panelWidth - 36).setStyle({ align: this.rtl ? 'right' : 'left' });
      this.quizAnswerButtons.forEach((button, index) => {
        button.setPosition(this.rtl ? this.panelWidth - 18 : 18, 350 + index * 46)
          .setOrigin(this.rtl ? 1 : 0, 0)
          .setFixedSize(this.panelWidth - 36, 38)
          .setWordWrapWidth(this.panelWidth - 60)
          .setStyle({ align: this.rtl ? 'right' : 'left' });
      });
    } else {
      const compact = metrics.compact;
      const portraitSize = compact ? 108 : 150;
      const portraitX = compact ? 86 : 108;
      const contentX = compact ? 168 : 220;
      const contentWidth = this.panelWidth - contentX - 24;
      this.portraitFrame.setPosition(20, compact ? 68 : 78).setSize(compact ? 132 : 176, compact ? 164 : 206);
      this.portrait.setPosition(portraitX, compact ? 142 : 175).setDisplaySize(portraitSize, portraitSize);
      this.professorName.setPosition(portraitX, compact ? 212 : 267).setWordWrapWidth(compact ? 120 : 160).setFontSize(compact ? '11px' : '13px');
      this.lessonTitle.setPosition(this.rtl ? this.panelWidth - 88 : contentX, compact ? 16 : 18).setOrigin(this.rtl ? 1 : 0, 0).setFontSize(compact ? '15px' : '18px').setWordWrapWidth(contentWidth);
      this.progress.setPosition(this.rtl ? 18 : this.panelWidth - 20, compact ? 20 : 20).setOrigin(this.rtl ? 0 : 1, 0);
      this.pageTitle.setPosition(this.rtl ? this.panelWidth - 24 : contentX, compact ? 70 : 88).setOrigin(this.rtl ? 1 : 0, 0).setFontSize(compact ? '17px' : '20px').setWordWrapWidth(contentWidth).setStyle({ align: this.rtl ? 'right' : 'left' });
      this.divider.setPosition(this.rtl ? 24 : contentX, compact ? 108 : 126).setSize(contentWidth, 2);
      this.pageText.setPosition(this.rtl ? this.panelWidth - 24 : contentX, compact ? 124 : 148).setOrigin(this.rtl ? 1 : 0, 0).setFontSize(compact ? '13px' : '16px').setWordWrapWidth(contentWidth).setStyle({ align: this.rtl ? 'right' : 'left' });
      const commandY = compact ? 186 : 206;
      const commandBlockY = compact ? 199 : 226;
      const stepsY = compact ? 164 : 198;
      const resultLabelY = compact ? 240 : 274;
      const resultBlockY = compact ? 258 : 292;
      this.commandLabel.setPosition(this.rtl ? this.panelWidth - 24 : contentX, commandY).setOrigin(this.rtl ? 1 : 0, 0).setVisible(false);
      this.commandBlock.setPosition(contentX, commandBlockY).setSize(contentWidth, 46).setVisible(false);
      this.commandText.setPosition(this.rtl ? this.panelWidth / 2 : contentX + contentWidth / 2, commandBlockY + 23).setVisible(false);
      this.stepsText.setPosition(this.rtl ? this.panelWidth - 24 : contentX, stepsY).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(contentWidth).setFontSize(compact ? '12px' : '14px').setStyle({ align: this.rtl ? 'right' : 'left' }).setVisible(false);
      this.resultLabel.setPosition(this.rtl ? this.panelWidth - 24 : contentX, resultLabelY).setOrigin(this.rtl ? 1 : 0, 0).setVisible(false);
      this.resultBlock.setPosition(contentX, resultBlockY).setSize(contentWidth, compact ? 42 : 50).setVisible(false);
      this.resultText.setPosition(this.rtl ? this.panelWidth - 36 : contentX + 16, resultBlockY + 9).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(Math.max(120, contentWidth - 32)).setFontSize(compact ? '10px' : '12px').setStyle({ align: this.rtl ? 'right' : 'left' }).setVisible(false);
      const compactDenseNavY = compact && densePage ? this.panelHeight - 20 : this.panelHeight - 28;
      this.previousButton.setPosition(this.rtl ? this.panelWidth - 22 : contentX, compactDenseNavY).setOrigin(this.rtl ? 1 : 0, 0.5);
      this.nextButton.setPosition(this.rtl ? contentX : this.panelWidth - 152, compactDenseNavY).setOrigin(this.rtl ? 0 : 1, 0.5);
      this.close.setPosition(this.rtl ? 20 : this.panelWidth - 20, compactDenseNavY).setOrigin(this.rtl ? 0 : 1, 0.5);
      const quizAnswerStart = compact ? 158 : 204;
      const quizActionY = this.panelHeight - (compact ? 58 : 64);
      this.quizButton.setPosition(this.panelWidth / 2, this.panelHeight - (compact ? 62 : 76)).setOrigin(0.5, 0.5);
      this.quizPracticeButton.setPosition(this.rtl ? 24 : this.panelWidth - 20, quizActionY).setOrigin(this.rtl ? 0 : 1, 0.5);
      this.quizPracticeHitTarget.setPosition(this.rtl ? 90 : this.panelWidth - 110, quizActionY).setSize(220, 56);
      this.quizFeedback.setPosition(this.rtl ? this.panelWidth - 24 : contentX, compact ? 270 : 336).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(contentWidth).setFontSize(compact ? '11px' : '13px').setStyle({ align: this.rtl ? 'right' : 'left' });
      this.quizAnswerButtons.forEach((button, index) => {
        button.setPosition(this.rtl ? this.panelWidth - 24 : contentX, quizAnswerStart + index * (compact ? 40 : 46))
          .setOrigin(this.rtl ? 1 : 0, 0)
          .setFixedSize(contentWidth, compact ? 34 : 38)
          .setWordWrapWidth(Math.max(160, contentWidth - 24))
          .setStyle({ align: this.rtl ? 'right' : 'left' });
      });
    }
    if (this.view === 'result') {
      if (metrics.portrait) {
        this.previousButton.setPosition(this.rtl ? this.panelWidth - 18 : 18, this.panelHeight - 160).setOrigin(this.rtl ? 1 : 0, 0.5);
        this.nextButton.setPosition(this.rtl ? this.panelWidth - 18 : 18, this.panelHeight - 110).setOrigin(this.rtl ? 1 : 0, 0.5);
        this.quizPracticeButton.setPosition(this.panelWidth / 2, this.panelHeight - 60).setOrigin(0.5, 0.5);
        const portraitPracticeWidth = Math.min(this.panelWidth - 36, 260);
        this.quizPracticeHitTarget.setPosition(this.panelWidth / 2, this.panelHeight - 60).setSize(portraitPracticeWidth, 56)
          .setInteractive(new Phaser.Geom.Rectangle(-portraitPracticeWidth / 2, -28, portraitPracticeWidth, 56), Phaser.Geom.Rectangle.Contains);
        this.close.setPosition(this.panelWidth / 2, this.panelHeight - 2).setOrigin(0.5, 1);
      } else {
        const actionY = this.panelHeight - (metrics.compact ? 58 : 64);
        const contentX = metrics.compact ? 168 : 220;
        const retryX = metrics.compact ? 420 : 520;
        this.previousButton.setPosition(this.rtl ? this.panelWidth - contentX : contentX, actionY).setOrigin(this.rtl ? 1 : 0, 0.5);
        this.nextButton.setPosition(this.rtl ? this.panelWidth - retryX : retryX, actionY).setOrigin(0.5, 0.5);
        this.quizPracticeButton.setPosition(this.rtl ? 24 : this.panelWidth - 20, actionY).setOrigin(this.rtl ? 0 : 1, 0.5);
        this.quizPracticeHitTarget.setPosition(this.rtl ? 90 : this.panelWidth - 110, actionY).setSize(220, 56)
          .setInteractive(new Phaser.Geom.Rectangle(-110, -28, 220, 56), Phaser.Geom.Rectangle.Contains);
        this.close.setPosition(this.rtl ? 20 : this.panelWidth - 20, this.panelHeight - 2).setOrigin(this.rtl ? 0 : 1, 1);
      }
    }
    this.refreshView();
  }

  private layoutForCurrentViewport(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    this.layout({ width, height, portrait: height > width, compact: width < 760 || height < 500, margin: width < 760 || height < 500 ? 12 : 20, topBarHeight: height > width ? 118 : width < 760 || height < 500 ? 88 : 64, safe: { left: 0, right: 0, top: 0, bottom: 0 } });
  }

  private makeButton(scene: Phaser.Scene, text: string, x: number, y: number, color: number, fontSize: number): Phaser.GameObjects.Text {
    return scene.add.text(x, y, text, {
      fontFamily: UITheme.fontFamily, fontSize: `${fontSize}px`, color: UITheme.colors.text,
      backgroundColor: '#' + color.toString(16).padStart(6, '0'), padding: { x: 12, y: 9 },
      align: 'center', stroke: UITheme.colors.panelShadow.toString(16), strokeThickness: 1,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
  }

  private refreshView(): void {
    if (this.view === 'course') this.refreshContent();
    else this.refreshQuizContent();
  }

  private refreshContent(): void {
    const page = this.pages[this.pageIndex];
    if (!page) return;
    this.pageTitle.setText(page.title);
    this.pageText.setText(page.text);
    this.commandText.setText(page.command ?? 'git init');
    const multilineCommand = Boolean(page.command?.includes('\n'));
    this.commandBlock.setSize(this.commandBlock.width, multilineCommand ? 64 : 46);
    this.commandText.setFontSize(multilineCommand ? '15px' : '19px').setLineSpacing(4);
    this.stepsText.setText(page.steps ?? '');
    this.resultText.setText(page.result ?? '');
    this.commandLabel.setVisible(Boolean(page.command));
    this.commandBlock.setVisible(Boolean(page.command));
    this.commandText.setVisible(Boolean(page.command));
    this.stepsText.setVisible(Boolean(page.steps));
    this.resultLabel.setVisible(Boolean(page.result));
    this.resultBlock.setVisible(Boolean(page.result));
    this.resultText.setVisible(Boolean(page.result));
    this.relayoutCourseContent(page);
    this.quizButton.setVisible(this.quizEnabled && this.pageIndex === this.pages.length - 1);
    this.quizPracticeButton.setVisible(false);
    this.quizPracticeHitTarget.setVisible(false);
    this.quizFeedback.setVisible(false);
    this.quizAnswerButtons.forEach((button) => button.setVisible(false));
    this.progress.setText(`${this.pageIndex + 1} / ${this.pages.length}`);
    this.previousButton.setText(this.i18n.text('coursePrevious'));
    this.nextButton.setText(page.action === 'practice' ? this.i18n.text('coursePractice') : page.action === 'close' ? this.i18n.text('courseFinish') : this.i18n.text('courseNext'));
    if (this.pageIndex === 0) {
      this.previousButton.setAlpha(0.42).disableInteractive();
    } else {
      this.previousButton.setAlpha(1).setInteractive({ useHandCursor: true });
    }
    // Text objects are created before localization fills their labels. Reset
    // their input regions after setText so touch devices receive the same
    // hitboxes as mouse and keyboard users.
    this.close.setInteractive({ useHandCursor: true });
    this.nextButton.setInteractive({ useHandCursor: true });
    if (this.quizEnabled && this.pageIndex === this.pages.length - 1) {
      this.quizButton.setInteractive({ useHandCursor: true });
    }
  }

  private relayoutCourseContent(page: ProfessorOctoCoursePage): void {
    const portrait = this.portraitLayout;
    const compact = !portrait && (this.scene.scale.width < 760 || this.scene.scale.height < 500);
    const contentX = portrait ? 18 : compact ? 168 : 220;
    const contentWidth = portrait ? this.panelWidth - 36 : this.panelWidth - contentX - 24;
    const textY = portrait ? 284 : compact ? 124 : 148;
    const align = this.rtl ? 'right' : 'left';
    const anchorX = this.rtl ? this.panelWidth - (portrait ? 18 : 24) : contentX;
    this.pageText.setPosition(anchorX, textY).setWordWrapWidth(contentWidth).setStyle({ align });

    let cursorY = textY + this.pageText.height + (compact ? 8 : 12);
    if (page.command) {
      const multiline = page.command.includes('\n');
      const blockHeight = multiline ? 64 : 46;
      this.commandLabel.setPosition(anchorX, cursorY).setOrigin(this.rtl ? 1 : 0, 0);
      const blockY = cursorY + 18;
      this.commandBlock.setPosition(contentX, blockY).setSize(contentWidth, blockHeight);
      this.commandText.setPosition(this.rtl ? this.panelWidth / 2 : contentX + contentWidth / 2, blockY + blockHeight / 2)
        .setFontSize(multiline ? (compact ? '12px' : '15px') : (compact ? '16px' : '19px'))
        .setLineSpacing(4);
      cursorY = blockY + blockHeight + (compact ? 8 : 10);
    }
    if (page.steps) {
      this.stepsText.setPosition(anchorX, cursorY).setOrigin(this.rtl ? 1 : 0, 0).setWordWrapWidth(contentWidth).setStyle({ align });
      cursorY += this.stepsText.height + (compact ? 6 : 10);
    }
    if (page.result) {
      this.resultLabel.setPosition(anchorX, cursorY).setOrigin(this.rtl ? 1 : 0, 0);
      const resultY = cursorY + 18;
      this.resultText.setWordWrapWidth(Math.max(120, contentWidth - 32)).setStyle({ align });
      const resultHeight = Math.max(compact ? 42 : portrait ? 54 : 50, this.resultText.height + (compact ? 12 : 16));
      this.resultBlock.setPosition(contentX, resultY).setSize(contentWidth, resultHeight);
      this.resultText.setPosition(this.rtl ? this.panelWidth - 36 : contentX + 16, resultY + 8).setOrigin(this.rtl ? 1 : 0, 0);
    }
  }

  private refreshQuizContent(): void {
    const quiz = this.quiz;
    if (!quiz) return;
    if (typeof document !== 'undefined') document.documentElement.dataset.gitquestCourseProgress = `${this.view}:${quiz.currentIndex}:${this.quizAnswer ? 'answered' : 'open'}`;
    this.commandLabel.setVisible(false);
    this.commandBlock.setVisible(false);
    this.commandText.setVisible(false);
    this.stepsText.setVisible(false);
    this.resultLabel.setVisible(false);
    this.resultBlock.setVisible(false);
    this.resultText.setVisible(false);
    this.quizButton.setVisible(false);
    if (this.view === 'quiz') {
      const question = quiz.currentQuestion;
      if (!question) return;
      this.pageTitle.setText(this.i18n.text('quizQuestionLabel') + ' ' + (quiz.currentIndex + 1));
      this.pageText.setText(question.prompt);
      this.progress.setText(`${quiz.currentIndex + 1} / ${quiz.questionCount}`);
      this.previousButton.setVisible(false).disableInteractive();
      this.quizPracticeButton.setVisible(false);
      this.quizPracticeHitTarget.setVisible(false);
      this.quizAnswerButtons.forEach((button, index) => {
        const selected = this.quizAnswer?.selectedIndex === index;
        const correct = this.quizAnswer?.correctIndex === index;
        let prefix = index === this.quizSelection && !this.quizAnswer ? '▶ ' : '  ';
        if (this.quizAnswer) prefix = selected ? (this.quizAnswer.correct ? '✓ ' : '✗ ') : correct ? '✓ ' : '  ';
        button.setText(prefix + question.answers[index]).setVisible(true);
        button.setInteractive({ useHandCursor: !this.quizAnswer });
        if (this.quizAnswer) button.disableInteractive();
        this.applyQuizButtonStyle(button, this.quizAnswer ? selected || correct ? this.quizAnswer.correct && correct ? 'correct' : selected ? 'incorrect' : 'correct' : 'normal' : index === this.quizSelection ? 'selected' : 'normal');
      });
      if (this.quizAnswer) {
        const label = this.i18n.text(this.quizAnswer.correct ? 'quizCorrect' : 'quizIncorrect');
        this.quizFeedback.setText((this.quizAnswer.correct ? '✓ ' : '✗ ') + label + ' : ' + this.quizAnswer.feedback).setVisible(true);
      } else {
        this.quizFeedback.setVisible(false);
      }
      this.nextButton.setVisible(Boolean(this.quizAnswer));
      this.nextButton.setText(quiz.currentIndex === quiz.questionCount - 1 ? this.i18n.text('quizSeeResult') : this.i18n.text('quizContinue'));
      this.nextButton.setInteractive({ useHandCursor: true });
      this.close.setVisible(true);
      this.close.setInteractive({ useHandCursor: true });
      return;
    }
    const scoreMessage = this.i18n.text(professorOctoQuizResultKey(this.levelId, quiz.score, quiz.questionCount));
    if (typeof document !== 'undefined') document.documentElement.dataset.gitquestCourseProgress = `result:${quiz.score}`;
    this.pageTitle.setText(this.i18n.text('quizTitle'));
    this.pageText.setText(this.i18n.text('quizScore') + ': ' + quiz.score + ' / ' + quiz.questionCount + '\n' + scoreMessage);
    this.progress.setText(`${quiz.score} / ${quiz.questionCount}`);
    this.quizAnswerButtons.forEach((button) => button.setVisible(false));
    this.quizFeedback.setVisible(false);
    this.previousButton.setVisible(true).setText(this.i18n.text('quizReview')).setAlpha(1).setInteractive({ useHandCursor: true });
    this.nextButton.setVisible(true).setText(this.i18n.text('quizRetry')).setInteractive({ useHandCursor: true });
    this.quizPracticeButton.setVisible(true).setText(this.i18n.text('quizPractice')).setInteractive({ useHandCursor: true });
    this.quizPracticeHitTarget.setVisible(true);
    this.close.setVisible(true);
  }

  private applyQuizButtonStyle(button: Phaser.GameObjects.Text, state: 'normal' | 'selected' | 'correct' | 'incorrect'): void {
    const styles = {
      normal: { backgroundColor: '#' + UITheme.colors.button.toString(16).padStart(6, '0'), color: UITheme.colors.text },
      selected: { backgroundColor: '#' + UITheme.colors.buttonHover.toString(16).padStart(6, '0'), color: UITheme.colors.text },
      correct: { backgroundColor: '#285b4c', color: UITheme.colors.text },
      incorrect: { backgroundColor: '#6b3542', color: UITheme.colors.text },
    } as const;
    button.setStyle(styles[state]);
  }

  private openQuiz(): void {
    if (!this.visible) return;
    this.view = 'quiz';
    this.quiz = new ProfessorOctoQuizSession(getProfessorOctoQuizQuestions(this.i18n, this.levelId));
    this.quizSelection = 0;
    this.quizAnswer = undefined;
    this.layoutForCurrentViewport();
  }

  private answerQuiz(index: number): void {
    if (!this.visible || this.view !== 'quiz' || !this.quiz) return;
    const answer = this.quiz.answer(index);
    if (!answer) return;
    this.quizAnswer = answer;
    this.quizSelection = index;
    this.refreshQuizContent();
  }

  private advanceQuiz(): void {
    if (!this.quiz?.answeredCurrent) return;
    if (this.quiz.complete) {
      this.view = 'result';
      this.quizAnswer = undefined;
      this.layoutForCurrentViewport();
      return;
    }
    this.quiz.next();
    this.quizSelection = 0;
    this.quizAnswer = undefined;
    this.layoutForCurrentViewport();
  }

  private reviewLesson(): void {
    this.view = 'course';
    this.pageIndex = 0;
    this.quiz = undefined;
    this.quizAnswer = undefined;
    this.layoutForCurrentViewport();
  }

  private retryQuiz(): void {
    this.view = 'quiz';
    this.quiz ??= new ProfessorOctoQuizSession(getProfessorOctoQuizQuestions(this.i18n, this.levelId));
    this.quiz.restart();
    this.quizSelection = 0;
    this.quizAnswer = undefined;
    this.layoutForCurrentViewport();
  }

  private moveQuizSelectionUp(): void {
    if (!this.visible || this.view !== 'quiz' || this.quizAnswer) return;
    this.quizSelection = (this.quizSelection + 2) % 3;
    this.refreshQuizContent();
  }

  private moveQuizSelectionDown(): void {
    if (!this.visible || this.view !== 'quiz' || this.quizAnswer) return;
    this.quizSelection = (this.quizSelection + 1) % 3;
    this.refreshQuizContent();
  }

  private handlePreviousAction(): void {
    if (!this.visible) return;
    if (this.view === 'course') this.previousPage();
    else if (this.view === 'result') this.reviewLesson();
  }

  private handleNextAction(): void {
    if (!this.visible) return;
    if (this.view === 'course') this.nextPage();
    else if (this.view === 'quiz') this.advanceQuiz();
    else this.retryQuiz();
  }

  private handleEnter(): void {
    if (!this.visible) return;
    if (this.view === 'quiz' && !this.quizAnswer) this.answerQuiz(this.quizSelection);
    else this.handleNextAction();
  }

  private handleQuizShortcut(): void {
    if (this.visible && this.view === 'course' && this.quizEnabled && this.pageIndex === this.pages.length - 1) this.openQuiz();
  }

  private handlePracticeShortcut(): void {
    if (this.visible && this.view === 'result') this.onClose('practice');
  }

  private handlePracticeButton(): void {
    if (this.visible && (this.view === 'course' || this.view === 'result')) {
      if (typeof document !== 'undefined') document.documentElement.dataset.gitquestCourseCloseReason = 'practice';
      this.onClose('practice');
    }
  }

  private previousPage(): void {
    if (!this.visible || this.pageIndex <= 0) return;
    this.pageIndex -= 1;
    this.layoutForCurrentViewport();
  }

  private nextPage(): void {
    if (!this.visible) return;
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex += 1;
      this.layoutForCurrentViewport();
      return;
    }
    this.onClose(this.pages[this.pageIndex]?.action === 'practice' ? 'practice' : 'close');
  }

  private handleEscape(): void {
    if (this.visible) this.onClose('close');
  }

  private handleShutdown(): void {
    this.destroy(true);
  }
}
