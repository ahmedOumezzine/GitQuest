import Phaser from 'phaser';
import type { Point } from '../models/game';
import { calculateTouchLayout, TOUCH_LAYOUT_SIZES, type LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';
import { interactionKeyEvents, terminalKeyEvent } from './InputBindings';

export class InputManager {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly touchButtons: Phaser.GameObjects.Container[] = [];
  private touchAction?: Phaser.GameObjects.Container;
  private touchTerminal?: Phaser.GameObjects.Container;
  private touchPad?: Phaser.GameObjects.Container;

  public constructor(private readonly scene: Phaser.Scene, onInteract: () => void, private readonly onTerminal: () => void, bindKeyboard = true) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    if (bindKeyboard) {
      interactionKeyEvents.forEach((eventName) => scene.input.keyboard!.on(eventName, onInteract));
      scene.input.keyboard!.on(terminalKeyEvent, onTerminal);
    }
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      interactionKeyEvents.forEach((eventName) => scene.input.keyboard?.off(eventName, onInteract));
      scene.input.keyboard?.off(terminalKeyEvent, onTerminal);
      this.touchPad?.destroy(true);
      this.touchButtons.length = 0;
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

  public bindTouch(buttons: Array<{ label: string; x: number; y: number; vector: Point }>, interact: () => void, labels = { interact: 'Interact', terminal: 'Terminal' }): void {
    this.touchPad = this.scene.add.container(0, 0).setDepth(30);
    const padBackground = this.scene.add.rectangle(0, 0, 164, 164, 0x18233e, 0.82).setOrigin(0.5).setStrokeStyle(2, 0xf7d56a, 0.9);
    const padCenter = this.scene.add.rectangle(0, 0, 48, 48, 0x273e68, 0.9).setOrigin(0.5).setStrokeStyle(1, 0x7e9bd1, 0.9);
    this.touchPad.add([padBackground, padCenter]);
    buttons.forEach((definition) => {
      const direction = this.createTouchDirection(definition.label, definition.vector);
      const offset = definition.vector.x !== 0 ? { x: definition.vector.x * 42, y: 0 } : { x: 0, y: definition.vector.y * 42 };
      direction.setPosition(offset.x, offset.y);
      this.touchPad?.add(direction);
      this.touchButtons.push(direction);
    });
    const touchHitArea = new Phaser.Geom.Rectangle(
      -TOUCH_LAYOUT_SIZES.actionHalf,
      -TOUCH_LAYOUT_SIZES.actionHalf,
      TOUCH_LAYOUT_SIZES.actionHalf * 2,
      TOUCH_LAYOUT_SIZES.actionHalf * 2,
    );
    this.touchAction = this.createTouchAction('E', labels.interact, 0xf7c84b, 0x18233e, touchHitArea);
    this.touchAction.on('pointerdown', interact);
    this.touchTerminal = this.createTouchAction('T', labels.terminal, 0x18233e, 0xfff6df, touchHitArea);
    this.touchTerminal.on('pointerdown', this.onTerminal);
  }

  private createTouchDirection(label: string, vector: Point): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0);
    const background = this.scene.add.rectangle(0, 0, 52, 52, 0x354d7d, 0.96).setOrigin(0.5).setStrokeStyle(2, 0x7e9bd1, 1);
    const text = this.scene.add.text(0, 0, label, { fontFamily: 'Courier New, monospace', fontSize: '22px', color: '#fff6df' }).setOrigin(0.5);
    button.add([background, text]);
    button.setSize(60, 60).setInteractive(new Phaser.Geom.Rectangle(-30, -30, 60, 60), Phaser.Geom.Rectangle.Contains);
    button.on('pointerdown', () => this.onTouchMove?.(vector));
    button.on('pointerup', () => this.onTouchMove?.({ x: 0, y: 0 }));
    button.on('pointerout', () => this.onTouchMove?.({ x: 0, y: 0 }));
    return button;
  }

  private createTouchAction(label: string, caption: string, fill: number, textColor: number, hitArea: Phaser.Geom.Rectangle): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0).setDepth(30);
    const circle = this.scene.add.circle(0, 0, 34, fill, 0.96).setStrokeStyle(3, label === 'E' ? 0xfff0a8 : 0x7e9bd1, 1);
    const text = this.scene.add.text(0, 0, label, { fontFamily: 'Courier New, monospace', fontSize: '22px', color: Phaser.Display.Color.IntegerToColor(textColor).rgba, stroke: '#10172b', strokeThickness: 1 }).setOrigin(0.5);
    const labelText = this.scene.add.text(0, 48, caption, { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#fff6df', backgroundColor: '#10172b', padding: { x: 5, y: 3 }, align: 'center' }).setName('touch-caption').setOrigin(0.5);
    button.add([circle, text, labelText]);
    button.setSize(68, 68).setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    return button;
  }

  public layoutTouch(metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin'>): void {
    const layout = calculateTouchLayout(metrics);
    this.touchPad?.setPosition(layout.joystick.x, layout.joystick.y);
    this.touchAction?.setPosition(layout.action.x, layout.action.y);
    this.touchTerminal?.setPosition(layout.terminal.x, layout.terminal.y);
  }

  public setTouchLabels(labels: { interact: string; terminal: string }): void {
    const actionLabel = this.touchAction?.getByName('touch-caption') as Phaser.GameObjects.Text | undefined;
    const terminalLabel = this.touchTerminal?.getByName('touch-caption') as Phaser.GameObjects.Text | undefined;
    actionLabel?.setText(labels.interact);
    terminalLabel?.setText(labels.terminal);
  }

  private onTouchMove?: (vector: Point) => void;

  public setTouchMoveHandler(handler: (vector: Point) => void): void { this.onTouchMove = handler; }

}
