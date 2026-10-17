import Phaser from 'phaser';
import { I18nManager } from '../managers/I18nManager';
import { PixelButton } from './PixelButton';
import { ResponsiveLayoutManager } from './layout/ResponsiveLayoutManager';
import { UITheme } from './theme/UITheme';

export interface IntroDialogueCallbacks {
  onStart: () => void;
  onSkip: () => void;
}

/**
 * Narrative dialogue component used only by the New Game introduction.
 * It deliberately does not touch GameSession or QuestManager: the first
 * quest step can only be completed by the real Midou interaction in WorldScene.
 */
export class IntroDialogue extends Phaser.GameObjects.Container {
  private readonly i18n: I18nManager;
  private readonly layout: ResponsiveLayoutManager;
  private readonly callbacks: IntroDialogueCallbacks;
  private pages: string[] = [];
  private pageIndex = 0;

  public constructor(scene: Phaser.Scene, i18n: I18nManager, layout: ResponsiveLayoutManager, callbacks: IntroDialogueCallbacks) {
    super(scene, 0, 0);
    this.i18n = i18n;
    this.layout = layout;
    this.callbacks = callbacks;
    this.pages = this.getPages();
    scene.add.existing(this);
    this.setDepth(20);
    scene.input.keyboard?.on('keydown-ENTER', this.advance, this);
    scene.input.keyboard?.on('keydown-SPACE', this.advance, this);
    scene.input.keyboard?.on('keydown-RIGHT', this.advance, this);
    scene.input.keyboard?.on('keydown-LEFT', this.goPrevious, this);
    scene.input.keyboard?.on('keydown-ESC', this.skip, this);
    this.render();
  }

  public refresh(locale: I18nManager['locale']): this {
    this.i18n.locale = locale;
    this.pages = this.getPages();
    this.pageIndex = Math.min(this.pageIndex, this.pages.length - 1);
    this.render();
    return this;
  }

  public render(): this {
    this.removeAll(true);
    if (typeof document !== 'undefined') document.documentElement.dataset.gitquestIntroPage = String(this.pageIndex + 1);
    const { width, height, margin, compact, portrait } = this.layout.current;
    const rtl = this.i18n.direction === 'rtl';
    const panelWidth = Math.min(portrait ? 560 : 960, width - margin * 2);
    const panelHeight = portrait ? Math.min(400, height * 0.48) : compact ? Math.min(220, height - margin * 2) : 252;
    const panelTop = height - margin - panelHeight;
    const panelY = panelTop + panelHeight / 2;
    const panelLeft = (width - panelWidth) / 2;
    const panelRight = panelLeft + panelWidth;

    const panel = this.scene.add.image(width / 2, panelY, 'menu-panel').setDisplaySize(panelWidth, panelHeight);
    const inner = this.scene.add.rectangle(width / 2, panelY + 2, panelWidth - 18, panelHeight - 18, UITheme.colors.panel, 0.72)
      .setStrokeStyle(2, UITheme.colors.borderAccent, 0.52);
    this.add([panel, inner]);

    const title = this.scene.add.text(width / 2, Math.max(margin + 20, panelTop - 28), this.i18n.text('introTitle'), {
      fontFamily: UITheme.fontFamily,
      fontSize: portrait ? '18px' : compact ? '20px' : '26px',
      color: '#f7d56a',
      stroke: '#10172b',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5);
    this.add(title);

    const portraitHeight = portrait ? 108 : compact ? 128 : 158;
    const portraitWidth = portraitHeight * 1312 / 1199;
    const portraitX = portrait ? (rtl ? panelRight - portraitWidth / 2 - 22 : panelLeft + portraitWidth / 2 + 22) : (rtl ? panelRight - portraitWidth / 2 - 35 : panelLeft + portraitWidth / 2 + 35);
    const portraitY = portrait ? panelTop + 72 : panelTop + panelHeight * 0.52;
    const portraitGlow = this.scene.add.ellipse(portraitX, portraitY + portraitHeight * 0.24, portraitWidth * 0.58, portraitHeight * 0.12, 0x0b1224, 0.65);
    const portraitImage = this.scene.add.image(portraitX, portraitY, 'midou-portrait-v3').setDisplaySize(portraitWidth, portraitHeight);
    this.add([portraitGlow, portraitImage]);

    const nameWidth = portrait ? 130 : 148;
    const nameX = portrait ? (rtl ? panelRight - nameWidth / 2 - 16 : panelLeft + nameWidth / 2 + 16) : (rtl ? panelRight - nameWidth / 2 - 12 : panelLeft + nameWidth / 2 + 12);
    const nameY = portrait ? panelTop + 30 : panelTop + 30;
    const nameplate = this.scene.add.rectangle(nameX, nameY, nameWidth, 32, UITheme.colors.panelRaised, 1).setStrokeStyle(2, UITheme.colors.borderAccent, 1);
    const name = this.scene.add.text(nameX, nameY, 'Midou', { fontFamily: UITheme.fontFamily, fontSize: compact ? '14px' : '16px', color: '#f7d56a', align: 'center' }).setOrigin(0.5);
    this.add([nameplate, name]);

    const contentTop = portrait ? panelTop + 128 : panelTop + 58;
    const contentBottom = panelTop + panelHeight - (portrait ? 106 : 62);
    const textWidth = portrait ? panelWidth - 30 : panelWidth - portraitWidth - 92;
    const textX = portrait ? width / 2 : rtl ? panelRight - textWidth / 2 - 22 : panelLeft + portraitWidth + 58 + textWidth / 2;
    const textAlign = rtl ? 'right' : 'left';
    const text = this.scene.add.text(textX, (contentTop + contentBottom) / 2, this.pages[this.pageIndex] ?? '', {
      fontFamily: UITheme.fontFamily,
      fontSize: portrait ? '14px' : compact ? '14px' : '18px',
      color: '#fff6df',
      align: textAlign,
      wordWrap: { width: Math.max(180, textWidth) },
      lineSpacing: portrait ? 6 : 8,
    }).setOrigin(0.5);
    this.add(text);

    const pageText = this.scene.add.text(rtl ? panelLeft + 24 : panelRight - 24, panelTop + 30, `${this.i18n.text('introPage')} ${this.pageIndex + 1} / ${this.pages.length}`, {
      fontFamily: UITheme.fontFamily,
      fontSize: compact ? '11px' : '13px',
      color: '#cbd5e1',
      align: rtl ? 'left' : 'right',
    }).setOrigin(rtl ? 0 : 1, 0.5);
    this.add(pageText);
    this.addProgressDots(width / 2, panelTop + 30, panelWidth, compact);

    const stacked = portrait || panelWidth < 560;
    const buttonY = panelTop + panelHeight - (stacked ? 66 : 32);
    const nextLabel = this.pageIndex === this.pages.length - 1 ? this.i18n.text('startAdventure') : this.i18n.text('introNext');
    const nextWidth = stacked ? panelWidth - 34 : 230;
    const skipWidth = stacked ? panelWidth - 34 : 132;
    const groupGap = 12;
    const groupLeft = width / 2 - (nextWidth + groupGap + skipWidth) / 2;
    const nextX = stacked ? width / 2 : rtl ? groupLeft + skipWidth + groupGap + nextWidth / 2 : groupLeft + nextWidth / 2;
    const skipX = stacked ? width / 2 : rtl ? groupLeft + skipWidth / 2 : groupLeft + nextWidth + groupGap + skipWidth / 2;
    const nextButton = new PixelButton(this.scene, nextLabel, { width: nextWidth, height: 46, fontSize: portrait ? '12px' : '14px', backgroundTexture: 'menu-button-gold' }).setPosition(nextX, stacked ? buttonY - 25 : buttonY);
    nextButton.onPress(() => this.advance());
    const skipButton = new PixelButton(this.scene, this.i18n.text('skip'), { width: skipWidth, height: 46, fontSize: portrait ? '12px' : '14px', backgroundTexture: 'menu-button-navy' }).setPosition(skipX, stacked ? buttonY + 25 : buttonY);
    skipButton.onPress(() => this.callbacks.onSkip());
    this.add([nextButton, skipButton]);
    // A centered Zone keeps the full visual button touchable after the
    // nested PixelButton containers are reparented into this dialogue box.
    this.addInteractiveTarget(nextX, stacked ? buttonY - 25 : buttonY, nextWidth, 46, () => this.advance());
    this.addInteractiveTarget(skipX, stacked ? buttonY + 25 : buttonY, skipWidth, 46, () => this.callbacks.onSkip());
    return this;
  }

  public override destroy(fromScene?: boolean): void {
    this.scene.input.keyboard?.off('keydown-ENTER', this.advance, this);
    this.scene.input.keyboard?.off('keydown-SPACE', this.advance, this);
    this.scene.input.keyboard?.off('keydown-RIGHT', this.advance, this);
    this.scene.input.keyboard?.off('keydown-LEFT', this.goPrevious, this);
    this.scene.input.keyboard?.off('keydown-ESC', this.skip, this);
    super.destroy(fromScene);
  }

  private addProgressDots(x: number, y: number, panelWidth: number, compact: boolean): void {
    const gap = compact ? 8 : 10;
    const dotWidth = compact ? 18 : 24;
    const start = x - ((this.pages.length - 1) * (dotWidth + gap)) / 2;
    this.pages.forEach((_page, index) => {
      const dot = this.scene.add.rectangle(start + index * (dotWidth + gap), y, dotWidth, 4, index === this.pageIndex ? UITheme.colors.buttonSelected : UITheme.colors.button, 1);
      dot.setStrokeStyle(1, UITheme.colors.borderAccent, index === this.pageIndex ? 1 : 0.4);
      this.add(dot);
    });
  }

  private addInteractiveTarget(x: number, y: number, width: number, height: number, callback: () => void): void {
    const target = this.scene.add.zone(x, y, width, height).setInteractive({ useHandCursor: true });
    target.on('pointerdown', callback);
    this.add(target);
  }

  private getPages(): string[] {
    return [this.i18n.text('introLine1'), this.i18n.text('introLine2'), this.i18n.text('introLine3'), this.i18n.text('introLine4')];
  }

  private advance(): void {
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex += 1;
      this.render();
      return;
    }
    this.callbacks.onStart();
  }

  private goPrevious(): void {
    if (this.pageIndex > 0) {
      this.pageIndex -= 1;
      this.render();
    }
  }

  private skip(): void {
    this.callbacks.onSkip();
  }
}
