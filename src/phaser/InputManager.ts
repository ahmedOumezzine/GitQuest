import Phaser from 'phaser';
import type { Point } from '../models/game';
import type { LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';

export class InputManager {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly touchButtons: Phaser.GameObjects.Text[] = [];
  private touchAction?: Phaser.GameObjects.Text;
  private touchTerminal?: Phaser.GameObjects.Text;
  private touchPad?: Phaser.GameObjects.Arc;
  private touchThumb?: Phaser.GameObjects.Arc;
  private touchPointerId: number | null = null;
  private touchCenter: Point = { x: 0, y: 0 };

  public constructor(private readonly scene: Phaser.Scene, onInteract: () => void, private readonly onTerminal: () => void, bindKeyboard = true) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    if (bindKeyboard) {
      scene.input.keyboard!.on('keydown-E', onInteract);
      scene.input.keyboard!.on('keydown-T', onTerminal);
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('pointermove', this.handlePointerMove, this);
      scene.input.off('pointerup', this.handlePointerUp, this);
      scene.input.off('pointerupoutside', this.handlePointerUp, this);
      this.touchPad?.destroy();
      this.touchThumb?.destroy();
      this.touchAction?.destroy();
      this.touchTerminal?.destroy();
    });
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
    // The legacy button description is kept for data compatibility, but the
    // visual control is now a single analogue-style pad with a larger hit area.
    void buttons;
    this.touchPad = this.scene.add.circle(0, 0, 54, 0x18233e, 0.76).setStrokeStyle(2, 0xf7d56a).setDepth(30).setInteractive(new Phaser.Geom.Circle(0, 0, 54), Phaser.Geom.Circle.Contains);
    this.touchThumb = this.scene.add.circle(0, 0, 18, 0xf7c84b, 0.92).setStrokeStyle(2, 0x10172b).setDepth(31);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.touchPad.on('pointerdown', (pointer: Phaser.Input.Pointer) => { this.touchPointerId = pointer.id; this.updateJoystick(pointer.x, pointer.y); });
    this.scene.input.on('pointerup', this.handlePointerUp, this);
    this.scene.input.on('pointerupoutside', this.handlePointerUp, this);
    this.touchAction = this.scene.add.text(870, 465, 'E', { fontFamily: 'monospace', fontSize: '20px', color: '#18233e', backgroundColor: '#f7c84b', padding: { x: 12, y: 12 }, align: 'center' }).setOrigin(0.5).setDepth(30).setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
    this.touchAction.on('pointerdown', interact);
    this.touchTerminal = this.scene.add.text(870, 395, 'T', { fontFamily: 'monospace', fontSize: '20px', color: '#fff6df', backgroundColor: '#18233e', padding: { x: 12, y: 12 }, align: 'center' }).setOrigin(0.5).setDepth(30).setInteractive(new Phaser.Geom.Rectangle(-22, -22, 44, 44), Phaser.Geom.Rectangle.Contains);
    this.touchTerminal.on('pointerdown', this.onTerminal);
  }

  public layoutTouch(metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin'>): void {
    const left = metrics.margin + 70;
    const bottom = metrics.height - metrics.margin - 70;
    this.touchCenter = { x: left, y: bottom };
    this.touchPad?.setPosition(left, bottom);
    this.touchThumb?.setPosition(left, bottom);
    this.touchAction?.setPosition(metrics.width - metrics.margin - 48, bottom);
    this.touchTerminal?.setPosition(metrics.width - metrics.margin - 48, bottom - 70);
  }

  private onTouchMove?: (vector: Point) => void;

  public setTouchMoveHandler(handler: (vector: Point) => void): void { this.onTouchMove = handler; }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.touchPointerId === pointer.id) this.updateJoystick(pointer.x, pointer.y);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.touchPointerId !== pointer.id) return;
    this.touchPointerId = null;
    this.touchThumb?.setPosition(this.touchCenter.x, this.touchCenter.y);
    this.onTouchMove?.({ x: 0, y: 0 });
  }

  private updateJoystick(x: number, y: number): void {
    const dx = x - this.touchCenter.x;
    const dy = y - this.touchCenter.y;
    const distance = Math.hypot(dx, dy);
    const radius = 42;
    const scale = distance > radius ? radius / distance : 1;
    this.touchThumb?.setPosition(this.touchCenter.x + dx * scale, this.touchCenter.y + dy * scale);
    const normalized = distance < 12 ? { x: 0, y: 0 } : { x: Math.round(dx / Math.max(distance, 1)), y: Math.round(dy / Math.max(distance, 1)) };
    this.onTouchMove?.(normalized);
  }
}
