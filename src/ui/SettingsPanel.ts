import Phaser from 'phaser';
import type { Locale, TouchControlsMode } from '../models/game';
import { I18nManager } from '../managers/I18nManager';
import { PixelButton } from './PixelButton';
import { ResponsiveLayoutManager, type LayoutMetrics } from './layout/ResponsiveLayoutManager';
import { UITheme } from './theme/UITheme';

export interface SettingsPanelCallbacks {
  onBack: () => void;
  onLocaleChange: (locale: Locale) => void;
  onTouchModeChange: () => void;
}

export class SettingsPanel extends Phaser.GameObjects.Container {
  private readonly i18n: I18nManager;
  private readonly title: Phaser.GameObjects.Text;
  private readonly languageLabel: Phaser.GameObjects.Text;
  private readonly touchLabel: Phaser.GameObjects.Text;
  private readonly touchModeButton: PixelButton;
  private readonly audioLabel: Phaser.GameObjects.Text;
  private readonly audioStatus: Phaser.GameObjects.Text;
  private readonly backButton: PixelButton;
  private readonly languageButtons: PixelButton[] = [];
  private readonly layout: ResponsiveLayoutManager;
  private readonly dimmer: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly panelArt: Phaser.GameObjects.Image;
  private readonly separators: Phaser.GameObjects.Rectangle[] = [];

  public constructor(scene: Phaser.Scene, i18n: I18nManager, callbacks: SettingsPanelCallbacks) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.i18n = i18n;
    this.layout = new ResponsiveLayoutManager(scene);
    scene.add.existing(this);
    this.setDepth(20);
    this.dimmer = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, UITheme.colors.ink, 0.9).setOrigin(0.5);
    this.panel = scene.add.rectangle(0, 0, 620, 430, UITheme.colors.panelShadow, 0.96).setOrigin(0.5);
    this.panelArt = scene.add.image(0, 0, 'menu-panel').setOrigin(0.5).setDisplaySize(620, 430).setAlpha(0.98);
    this.add([this.dimmer, this.panel, this.panelArt]);
    [0, 1, 2, 3].forEach(() => {
      const line = scene.add.rectangle(0, 0, 520, 2, UITheme.colors.panelLine, 0.9).setOrigin(0.5);
      this.separators.push(line);
      this.add(line);
    });
    this.title = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '25px', color: UITheme.colors.accent, align: 'center', stroke: '#10172b', strokeThickness: 2 }).setOrigin(0.5);
    this.languageLabel = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '16px', color: UITheme.colors.text, align: 'center' }).setOrigin(0.5);
    this.add([this.title, this.languageLabel]);
    (['fr', 'en', 'ar'] as const).forEach((locale, index) => {
      const button = new PixelButton(scene, locale.toUpperCase(), { width: 72, height: 44, fontSize: '15px', backgroundTexture: 'menu-button-navy' });
      button.onPress(() => callbacks.onLocaleChange(locale));
      this.languageButtons.push(button);
      this.add(button);
    });
    this.touchLabel = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '16px', color: UITheme.colors.text, align: 'center' }).setOrigin(0.5);
    this.add(this.touchLabel);
    this.touchModeButton = new PixelButton(scene, '', { width: 220, height: 44, fontSize: '14px' }).onPress(callbacks.onTouchModeChange);
    this.add(this.touchModeButton);
    this.audioLabel = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '16px', color: UITheme.colors.text, align: 'center' }).setOrigin(0.5);
    this.audioStatus = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '12px', color: '#f4c06b', align: 'center', wordWrap: { width: 500 } }).setOrigin(0.5);
    this.add([this.audioLabel, this.audioStatus]);
    this.backButton = new PixelButton(scene, '', { width: 500, height: 50, fontSize: '19px', backgroundTexture: 'menu-button-navy' }).onPress(callbacks.onBack);
    this.add(this.backButton);
    this.layout.onResize((metrics) => this.applyLayout(metrics));
    this.refresh(i18n.locale, 'auto');
  }

  public refresh(locale: Locale, touchMode: TouchControlsMode): void {
    this.i18n.locale = locale;
    this.title.setText(this.i18n.text('settingsTitle'));
    this.languageLabel.setText(this.i18n.text('language'));
    this.touchLabel.setText(this.i18n.text('touchControls'));
    this.touchModeButton.setLabel(this.i18n.text(touchMode === 'auto' ? 'touchAuto' : 'touchAlways'));
    this.audioLabel.setText(this.i18n.text('audio'));
    this.audioStatus.setText(this.i18n.text('audioUnavailable'));
    this.backButton.setLabel(this.i18n.text('back'));
    this.languageButtons.forEach((button, index) => button.setSelected((['fr', 'en', 'ar'] as const)[index] === locale));
  }

  private applyLayout(metrics: LayoutMetrics): void {
    const panelWidth = Math.min(UITheme.panel.maxWidth, metrics.width - metrics.margin * 2);
    const panelHeight = Math.min(430, Math.max(300, metrics.height - metrics.margin * 2));
    this.setPosition(metrics.width / 2, metrics.height / 2);
    this.dimmer.setSize(metrics.width, metrics.height);
    this.panel.setSize(panelWidth, panelHeight);
    this.panelArt.setDisplaySize(panelWidth, panelHeight);
    const compact = metrics.compact || panelWidth < 520;
    const top = -panelHeight / 2;
    const titleSize = compact ? '20px' : '25px';
    this.title.setFontSize(titleSize).setPosition(0, top + (compact ? 30 : 36));
    this.separators[0].setSize(Math.max(180, panelWidth - 72), 2).setPosition(0, top + (compact ? 57 : 66));
    this.languageLabel.setFontSize(compact ? '14px' : '16px').setPosition(0, top + (compact ? 72 : 86));
    const languageWidth = Math.max(60, Math.min(90, (panelWidth - 64) / 3 - 8));
    const languageGap = compact ? 8 : 14;
    const languageTotal = languageWidth * 3 + languageGap * 2;
    this.languageButtons.forEach((button, index) => button.setDimensions(languageWidth, UITheme.minTouchTarget, compact ? '13px' : '15px').setPosition(-languageTotal / 2 + languageWidth / 2 + index * (languageWidth + languageGap), top + (compact ? 112 : 128)));
    this.separators[1].setSize(Math.max(180, panelWidth - 72), 2).setPosition(0, top + (compact ? 136 : 151));
    this.touchLabel.setFontSize(compact ? '14px' : '16px').setPosition(0, top + (compact ? 156 : 176));
    this.touchModeButton.setDimensions(Math.min(250, panelWidth - 54), UITheme.minTouchTarget, compact ? '13px' : '14px').setPosition(0, top + (compact ? 190 : 214));
    this.separators[2].setSize(Math.max(180, panelWidth - 72), 2).setPosition(0, top + (compact ? 208 : 239));
    this.audioLabel.setFontSize(compact ? '14px' : '16px').setPosition(0, top + (compact ? 228 : 258));
    this.audioStatus.setWordWrapWidth(Math.max(180, panelWidth - 54)).setFontSize(compact ? '11px' : '12px').setPosition(0, top + (compact ? 255 : 290));
    this.separators[3].setSize(Math.max(180, panelWidth - 72), 2).setPosition(0, panelHeight / 2 - (compact ? 68 : 78));
    this.backButton.setDimensions(Math.max(UITheme.minTouchTarget, panelWidth - 54), UITheme.minTouchTarget, compact ? '16px' : '19px').setPosition(0, panelHeight / 2 - (compact ? 36 : 42));
  }
}
