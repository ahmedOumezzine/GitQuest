import Phaser from 'phaser';
import type { Point } from '../models/game';
import type { LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';

export class InputManager {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly touchButtons: Phaser.GameObjects.Text[] = [];
  private touchAction?: Phaser.GameObjects.Text;

  public constructor(private readonly scene: Phaser.Scene, onInteract: () => void, onTerminal: () => void, bindKeyboard = true) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    if (bindKeyboard) {
      scene.input.keyboard!.on('keydown-E', onInteract);
      scene.input.keyboard!.on('keydown-T', onTerminal);
    }
  }

  public movement(): Point {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) x -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) x += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) y -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) y += 1;
    return { x, y };
  }

  public bindTouch(buttons: Array<{ label: string; x: number; y: number; vector: Point }>, interact: () => void): void {
    buttons.forEach(({ label, x, y, vector }) => {
      const button = this.scene.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '20px', color: '#fff6df', backgroundColor: '#18233e', padding: { x: 12, y: 12 }, align: 'center' }).setOrigin(0.5).setAlpha(0.8).setDepth(30).setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
      button.on('pointerdown', () => this.onTouchMove?.(vector));
      button.on('pointerup', () => this.onTouchMove?.({ x: 0, y: 0 }));
      button.on('pointerupoutside', () => this.onTouchMove?.({ x: 0, y: 0 }));
      this.touchButtons.push(button);
    });
    this.touchAction = this.scene.add.text(870, 465, 'E', { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7c84b', padding: { x: 12, y: 12 }, align: 'center' }).setOrigin(0.5).setDepth(30).setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
    this.touchAction.on('pointerdown', interact);
  }

  public layoutTouch(metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin'>): void {
    const left = metrics.margin + 48;
    const bottom = metrics.height - metrics.margin - 48;
    const positions = [
      { x: left - 48, y: bottom },
      { x: left + 48, y: bottom },
      { x: left, y: bottom - 48 },
      { x: left, y: bottom + 48 },
    ];
    this.touchButtons.forEach((button, index) => button.setPosition(positions[index].x, positions[index].y));
    this.touchAction?.setPosition(metrics.width - metrics.margin - 48, bottom);
  }

  private onTouchMove?: (vector: Point) => void;

  public setTouchMoveHandler(handler: (vector: Point) => void): void { this.onTouchMove = handler; }
}
