import Phaser from 'phaser';
import { UITheme, type UIControlState } from './theme/UITheme';

export interface PixelButtonOptions {
  width?: number;
  height?: number;
  fontSize?: string;
  selected?: boolean;
  backgroundTexture?: string;
}

export class PixelButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private readonly textureBackground: boolean;
  private readonly backgroundTextureKey?: string;
  private readonly label: Phaser.GameObjects.Text;
  private widthValue: number;
  private heightValue: number;
  private selected = false;
  private enabled = true;
  private uiState: UIControlState = 'normal';

  public constructor(scene: Phaser.Scene, label: string, options: PixelButtonOptions = {}) {
    super(scene, 0, 0);
    this.widthValue = Math.max(UITheme.minTouchTarget, options.width ?? UITheme.button.compactWidth);
    this.heightValue = Math.max(UITheme.minTouchTarget, options.height ?? UITheme.button.compactHeight);
    this.selected = options.selected ?? false;
    this.backgroundTextureKey = options.backgroundTexture;
    this.textureBackground = Boolean(options.backgroundTexture);
    this.background = options.backgroundTexture
      ? scene.add.image(0, 0, options.backgroundTexture).setOrigin(0.5).setDisplaySize(this.widthValue, this.heightValue)
      : scene.add.rectangle(0, 0, this.widthValue, this.heightValue, UITheme.colors.button, 1).setOrigin(0.5).setStrokeStyle(UITheme.borderWidth, UITheme.colors.border);
    this.label = scene.add.text(0, 0, label, { fontFamily: UITheme.fontFamily, fontSize: options.fontSize ?? '20px', color: UITheme.colors.text, align: 'center' }).setOrigin(0.5);
    this.add([this.background, this.label]);
    this.setSize(this.widthValue, this.heightValue);
    // The rectangle is the actual visual hit target. Keeping the hit area on
    // the child avoids Container input quirks after the button is reparented.
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.widthValue, this.heightValue),
      Phaser.Geom.Rectangle.Contains,
    );
    this.background.on('pointerover', () => { if (this.enabled) { this.uiState = this.selected ? 'selected' : 'hover'; this.applyStyle(); } });
    this.background.on('pointerout', () => { if (this.enabled) { this.uiState = this.selected ? 'selected' : 'normal'; this.applyStyle(); } });
    this.background.on('pointerdown', () => { if (this.enabled) { this.uiState = 'pressed'; this.applyStyle(); } });
    this.background.on('pointerup', () => { if (this.enabled) { this.uiState = this.selected ? 'selected' : 'hover'; this.applyStyle(); } });
    scene.add.existing(this);
    this.applyStyle();
  }

  public setLabel(value: string): this { this.label.setText(value); return this; }
  public setSelected(value: boolean): this { this.selected = value; this.uiState = value ? 'selected' : 'normal'; this.applyStyle(); return this; }
  public setFocused(value: boolean): this { if (this.enabled && !this.selected) this.uiState = value ? 'focus' : 'normal'; this.applyStyle(); return this; }
  public setHighlighted(value: boolean): this { if (this.enabled) { this.uiState = value ? 'hover' : (this.selected ? 'selected' : 'normal'); this.applyStyle(); } return this; }
  public setDimensions(width: number, height: number, fontSize?: string): this {
    this.widthValue = Math.max(UITheme.minTouchTarget, width);
    this.heightValue = Math.max(UITheme.minTouchTarget, height);
    this.setSize(this.widthValue, this.heightValue);
    if (this.textureBackground) this.background.setDisplaySize(this.widthValue, this.heightValue);
    else (this.background as Phaser.GameObjects.Rectangle).setSize(this.widthValue, this.heightValue);
    this.background.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.widthValue, this.heightValue), Phaser.Geom.Rectangle.Contains);
    if (fontSize) this.label.setFontSize(fontSize);
    return this;
  }
  public onPress(callback: () => void): this { this.background.on('pointerdown', callback); return this; }
  public setEnabled(value: boolean): this {
    this.enabled = value;
    this.background.disableInteractive();
    if (value) {
      this.background.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, this.widthValue, this.heightValue),
        Phaser.Geom.Rectangle.Contains,
      );
    }
    this.uiState = value ? (this.selected ? 'selected' : 'normal') : 'disabled';
    this.setAlpha(value ? 1 : 0.5);
    this.applyStyle();
    return this;
  }

  private applyStyle(): void {
    const fill = this.uiState === 'selected' || this.uiState === 'hover' || this.uiState === 'focus' || this.uiState === 'pressed'
      ? (this.uiState === 'pressed' ? UITheme.colors.buttonPressed : UITheme.colors.buttonHover)
      : UITheme.colors.button;
    const border = this.uiState === 'selected' || this.uiState === 'focus' ? UITheme.colors.borderAccent : UITheme.colors.border;
    if (this.textureBackground) {
      const image = this.background as Phaser.GameObjects.Image;
      image.clearTint();
      if (this.uiState === 'hover' || this.uiState === 'focus') image.setTint(0xffefb0);
      if (this.uiState === 'pressed') image.setTint(0xffd86b);
      if (this.uiState === 'disabled') image.setTint(0x66708a);
    } else {
      (this.background as Phaser.GameObjects.Rectangle).setFillStyle(fill, 1).setStrokeStyle(UITheme.borderWidth, border);
    }
    const highlighted = this.uiState === 'selected' || this.uiState === 'hover' || this.uiState === 'focus' || this.uiState === 'pressed';
    const darkLabel = !this.textureBackground || this.backgroundTextureKey === 'menu-button-gold';
    this.label.setColor(highlighted && darkLabel ? '#18233e' : UITheme.colors.text);
  }
}
