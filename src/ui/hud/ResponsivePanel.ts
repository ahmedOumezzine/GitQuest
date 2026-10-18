import Phaser from 'phaser';
import { UITheme } from '../theme/UITheme';

export interface ResponsivePanelOptions {
  fillColor?: number;
  fillAlpha?: number;
  borderColor?: number;
  borderWidth?: number;
}

/** Small reusable pixel-style panel used by the in-game HUD. */
export class ResponsivePanel extends Phaser.GameObjects.Container {
  private readonly shadow: Phaser.GameObjects.Rectangle;
  protected readonly panel: Phaser.GameObjects.Rectangle;
  private readonly accent: Phaser.GameObjects.Rectangle;

  public constructor(scene: Phaser.Scene, width: number, height: number, options: ResponsivePanelOptions = {}) {
    super(scene, 0, 0);
    this.shadow = scene.add.rectangle(3, 4, width, height, UITheme.colors.panelShadow, 0.6).setOrigin(0);
    this.panel = scene.add.rectangle(0, 0, width, height, options.fillColor ?? UITheme.colors.panel, options.fillAlpha ?? 0.92)
      .setOrigin(0)
      .setStrokeStyle(options.borderWidth ?? 2, options.borderColor ?? UITheme.colors.borderAccent, 0.85);
    this.accent = scene.add.rectangle(10, 3, Math.max(30, width - 20), 2, UITheme.colors.goldSoft, 0.9).setOrigin(0);
    this.add([this.shadow, this.panel, this.accent]);
  }

  public setPanelSize(width: number, height: number): this {
    this.panel.setSize(Math.max(1, width), Math.max(1, height));
    this.shadow.setSize(Math.max(1, width), Math.max(1, height));
    this.accent.setSize(Math.max(30, width - 20), 2);
    return this;
  }

  public get panelWidth(): number { return this.panel.width; }
  public get panelHeight(): number { return this.panel.height; }
}
