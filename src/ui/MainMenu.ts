import Phaser from 'phaser';
import type { Locale } from '../models/game';
import { I18nManager } from '../managers/I18nManager';
import { PixelButton } from './PixelButton';
import { calculateMenuCenterY, ResponsiveLayoutManager, type LayoutMetrics } from './layout/ResponsiveLayoutManager';
import { UITheme } from './theme/UITheme';

export interface MainMenuCallbacks {
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onLocaleChange: (locale: Locale) => void;
}

export class MainMenu extends Phaser.GameObjects.Container {
  private readonly newGameButton: PixelButton;
  private readonly continueButton?: PixelButton;
  private readonly settingsButton: PixelButton;
  private readonly languageButtons: PixelButton[] = [];
  private readonly callbacks: MainMenuCallbacks;
  private readonly i18n: I18nManager;
  private readonly layout: ResponsiveLayoutManager;
  private readonly hasSave: boolean;

  public constructor(scene: Phaser.Scene, hasSave: boolean, i18n: I18nManager, callbacks: MainMenuCallbacks) {
    super(scene, 0, 0);
    this.callbacks = callbacks;
    this.i18n = i18n;
    this.hasSave = hasSave;
    this.layout = new ResponsiveLayoutManager(scene);
    scene.add.existing(this);
    this.setDepth(10);
    this.newGameButton = new PixelButton(scene, i18n.text('newGame'), { width: UITheme.button.width, height: UITheme.button.height, fontSize: '21px', backgroundTexture: 'menu-button-gold' });
    this.newGameButton.onPress(callbacks.onNewGame);
    this.add(this.newGameButton);
    if (hasSave) {
      this.continueButton = new PixelButton(scene, i18n.text('continueGame'), { width: UITheme.button.width, height: UITheme.button.height, fontSize: '21px', backgroundTexture: 'menu-button-navy' });
      this.continueButton.onPress(callbacks.onContinue);
      this.add(this.continueButton);
    }
    this.settingsButton = new PixelButton(scene, i18n.text('settings'), { width: UITheme.button.width, height: UITheme.button.height, fontSize: '21px', backgroundTexture: 'menu-button-navy' });
    this.settingsButton.onPress(callbacks.onSettings);
    this.add(this.settingsButton);
    (['fr', 'en', 'ar'] as const).forEach((locale, index) => {
      // Keep the language selector on the proven rectangle hit target. Its
      // selected gold border is more important than using a stretched button
      // texture for this small control.
      const button = new PixelButton(scene, locale.toUpperCase(), { width: 54, height: 44, fontSize: '13px' });
      button.onPress(() => callbacks.onLocaleChange(locale));
      this.languageButtons.push(button);
      this.add(button);
    });
    this.layout.onResize((metrics) => this.applyLayout(metrics));
    this.refresh(i18n.locale);
  }

  public refresh(locale: Locale): void {
    this.i18n.locale = locale;
    this.newGameButton.setLabel(this.i18n.text('newGame'));
    this.continueButton?.setLabel(this.i18n.text('continueGame'));
    this.settingsButton.setLabel(this.i18n.text('settings'));
    this.languageButtons.forEach((button, index) => button.setSelected((['fr', 'en', 'ar'] as const)[index] === locale));
  }

  public setMenuVisible(value: boolean): this { this.setVisible(value); return this; }

  private applyLayout(metrics: LayoutMetrics): void {
    const buttonWidth = Math.min(metrics.compact ? UITheme.menuButton.compactWidth : UITheme.menuButton.width, metrics.width - metrics.margin * 2);
    const buttonHeight = metrics.compact ? UITheme.menuButton.compactHeight : UITheme.menuButton.height;
    const fontSize = metrics.compact ? '18px' : '21px';
    const gap = metrics.compact ? 10 : 12;
    const buttons = [this.newGameButton, ...(this.continueButton ? [this.continueButton] : []), this.settingsButton];
    const totalHeight = buttons.length * buttonHeight + (buttons.length - 1) * gap;
    // En paysage compact, le logo et le parchemin occupent déjà la zone
    // centrale : ancrer les actions en bas évite leur chevauchement.
    const centerY = calculateMenuCenterY(metrics, totalHeight);
    let y = centerY - totalHeight / 2 + buttonHeight / 2;
    buttons.forEach((button) => {
      button.setDimensions(buttonWidth, buttonHeight, fontSize).setPosition(metrics.width / 2, y);
      y += buttonHeight + gap;
    });
    // Keep the desktop hit positions stable for keyboard/mouse QA and for
    // existing saved layouts; the navy texture provides the visual upgrade.
    const languageWidth = metrics.compact ? 48 : 54;
    const languageGap = metrics.compact ? 6 : 8;
    const totalLanguageWidth = languageWidth * this.languageButtons.length + languageGap * (this.languageButtons.length - 1);
    const startX = metrics.width - metrics.margin - totalLanguageWidth + languageWidth / 2;
    this.languageButtons.forEach((button, index) => {
      button.setDimensions(languageWidth, UITheme.minTouchTarget, '13px').setPosition(startX + index * (languageWidth + languageGap), metrics.margin + UITheme.minTouchTarget / 2);
    });
  }
}
