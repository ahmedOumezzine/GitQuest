import Phaser from 'phaser';
import type { Locale } from '../models/game';
import { I18nManager } from '../managers/I18nManager';
import { PixelButton } from './PixelButton';
import { ResponsiveLayoutManager, type LayoutMetrics } from './layout/ResponsiveLayoutManager';
import { UITheme } from './theme/UITheme';

export interface ConfirmPanelCallbacks {
  onConfirm: () => void;
  onCancel: () => void;
}

export class ConfirmPanel extends Phaser.GameObjects.Container {
  private readonly i18n: I18nManager;
  private readonly title: Phaser.GameObjects.Text;
  private readonly message: Phaser.GameObjects.Text;
  private readonly confirmButton: PixelButton;
  private readonly cancelButton: PixelButton;
  private readonly layout: ResponsiveLayoutManager;
  private readonly dimmer: Phaser.GameObjects.Rectangle;
  private readonly panel: Phaser.GameObjects.Rectangle;

  public constructor(scene: Phaser.Scene, i18n: I18nManager, callbacks: ConfirmPanelCallbacks) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.i18n = i18n;
    this.layout = new ResponsiveLayoutManager(scene);
    scene.add.existing(this);
    this.setDepth(30);

    this.dimmer = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, UITheme.colors.ink, 0.9).setOrigin(0.5);
    this.panel = scene.add.rectangle(0, 0, 620, 250, UITheme.colors.panel, 0.99).setOrigin(0.5).setStrokeStyle(UITheme.panelBorderWidth, UITheme.colors.borderAccent);
    this.add([this.dimmer, this.panel]);
    this.title = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '24px', color: UITheme.colors.accent, align: 'center' }).setOrigin(0.5);
    this.message = scene.add.text(0, 0, '', { fontFamily: UITheme.fontFamily, fontSize: '15px', color: UITheme.colors.text, align: 'center', wordWrap: { width: 510 } }).setOrigin(0.5);
    this.add([this.title, this.message]);

    this.confirmButton = new PixelButton(scene, '', { width: 210, height: 48, fontSize: '16px' }).onPress(callbacks.onConfirm);
    this.cancelButton = new PixelButton(scene, '', { width: 210, height: 48, fontSize: '16px' }).onPress(callbacks.onCancel);
    this.add([this.confirmButton, this.cancelButton]);
    this.layout.onResize((metrics) => this.applyLayout(metrics));
    this.refresh(i18n.locale);
  }

  public refresh(locale: Locale): this {
    this.i18n.locale = locale;
    this.title.setText(this.i18n.text('newGameConfirmTitle'));
    this.message.setText(this.i18n.text('newGameConfirmMessage'));
    this.confirmButton.setLabel(this.i18n.text('confirm'));
    this.cancelButton.setLabel(this.i18n.text('cancel'));
    return this;
  }

  private applyLayout(metrics: LayoutMetrics): void {
    const panelWidth = Math.min(UITheme.panel.maxWidth, metrics.width - metrics.margin * 2);
    const compact = metrics.compact || panelWidth < 560;
    const panelHeight = compact ? Math.min(330, Math.max(280, metrics.height - metrics.margin * 2)) : 250;
    this.setPosition(metrics.width / 2, metrics.height / 2);
    this.dimmer.setSize(metrics.width, metrics.height);
    this.panel.setSize(panelWidth, panelHeight);
    const top = -panelHeight / 2;
    this.title.setFontSize(compact ? '20px' : '24px').setPosition(0, top + 36);
    this.message.setFontSize(compact ? '13px' : '15px').setWordWrapWidth(Math.max(180, panelWidth - 48)).setPosition(0, top + (compact ? 92 : 86));
    if (compact) {
      const buttonWidth = Math.max(UITheme.minTouchTarget, panelWidth - 48);
      this.confirmButton.setDimensions(buttonWidth, UITheme.minTouchTarget, '15px').setPosition(0, panelHeight / 2 - 82);
      this.cancelButton.setDimensions(buttonWidth, UITheme.minTouchTarget, '15px').setPosition(0, panelHeight / 2 - 28);
    } else {
      this.confirmButton.setDimensions(210, UITheme.minTouchTarget, '16px').setPosition(-118, panelHeight / 2 - 36);
      this.cancelButton.setDimensions(210, UITheme.minTouchTarget, '16px').setPosition(118, panelHeight / 2 - 36);
    }
  }
}
