import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
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
    const padShadow = this.scene.add.circle(3, 5, 84, 0x081126, 0.35);
    const padBackground = this.scene.add.rectangle(0, 0, 164, 164, 0x18233e, 0.86).setOrigin(0.5).setStrokeStyle(2, 0xf7d56a, 0.9);
    const padCenter = this.scene.add.circle(0, 0, 27, 0x273e68, 0.98).setStrokeStyle(2, 0x9bb6e8, 0.95);
    const padCenterDot = this.scene.add.circle(0, 0, 7, 0xf7d56a, 0.9);
    this.touchPad.add([padShadow, padBackground, padCenter, padCenterDot]);
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
    this.touchAction.on('pointerdown', () => {
      const button = this.touchAction;
      if (!button) return;
      this.setTouchButtonPressed(button, true);
      this.flashTouchButton(button);
      audioManager.play('touch');
      interact();
    });
    this.bindTouchRelease(this.touchAction);
    this.touchTerminal = this.createTouchAction('T', labels.terminal, 0x18233e, 0xfff6df, touchHitArea);
    this.touchTerminal.on('pointerdown', () => {
      const button = this.touchTerminal;
      if (!button) return;
      this.setTouchButtonPressed(button, true);
      this.flashTouchButton(button);
      audioManager.play('touch');
      this.onTerminal();
    });
    this.bindTouchRelease(this.touchTerminal);
  }

  private createTouchDirection(label: string, vector: Point): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0);
    const background = this.scene.add.rectangle(0, 0, 56, 56, 0x354d7d, 0.98).setOrigin(0.5).setStrokeStyle(2, 0x9bb6e8, 1);
    const highlight = this.scene.add.rectangle(0, -17, 34, 3, 0xfff6df, 0.28).setOrigin(0.5);
    const text = this.scene.add.text(0, 0, label, { fontFamily: 'Courier New, monospace', fontSize: '24px', color: '#fff6df', stroke: '#10172b', strokeThickness: 1 }).setOrigin(0.5);
    button.add([background, highlight, text]);
    button.setSize(68, 68).setInteractive(new Phaser.Geom.Rectangle(-34, -34, 68, 68), Phaser.Geom.Rectangle.Contains);
    button.on('pointerdown', () => {
      this.setTouchDirectionPressed(button, true);
      audioManager.play('touch');
      this.onTouchMove?.(vector);
    });
    const release = () => {
      this.setTouchDirectionPressed(button, false);
      this.onTouchMove?.({ x: 0, y: 0 });
    };
    button.on('pointerup', release);
    button.on('pointerupoutside', release);
    button.on('pointerout', release);
    return button;
  }

  private createTouchAction(label: string, caption: string, fill: number, textColor: number, hitArea: Phaser.Geom.Rectangle): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0).setDepth(30);
    const accent = label === 'E' ? 0xfff0a8 : 0x9bb6e8;
    const halo = this.scene.add.circle(0, 0, 52, fill, 0.18).setStrokeStyle(2, accent, 0.55);
    const circle = this.scene.add.circle(0, 0, 44, fill, 0.98).setStrokeStyle(3, accent, 1);
    const innerRing = this.scene.add.circle(0, 0, 35, fill, 0).setStrokeStyle(1, 0xffffff, 0.24);
    const text = this.scene.add.text(0, 0, label, { fontFamily: 'Courier New, monospace', fontSize: '26px', color: Phaser.Display.Color.IntegerToColor(textColor).rgba, stroke: '#10172b', strokeThickness: 2 }).setOrigin(0.5);
    const labelText = this.scene.add.text(0, 63, caption, { fontFamily: 'Courier New, monospace', fontSize: '10px', color: '#fff6df', backgroundColor: '#10172b', padding: { x: 6, y: 3 }, stroke: '#10172b', strokeThickness: 1, align: 'center' }).setName('touch-caption').setOrigin(0.5);
    button.add([halo, circle, innerRing, text, labelText]);
    button.setSize(84, 84).setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    return button;
  }

  private bindTouchRelease(button: Phaser.GameObjects.Container): void {
    const release = () => this.setTouchButtonPressed(button, false);
    button.on('pointerup', release);
    button.on('pointerupoutside', release);
    button.on('pointerout', release);
  }

  private setTouchButtonPressed(button: Phaser.GameObjects.Container | undefined, pressed: boolean): void {
    if (!button) return;
    button.setScale(pressed ? 0.93 : 1);
    const halo = button.list[0] as Phaser.GameObjects.Arc | undefined;
    halo?.setAlpha(pressed ? 0.42 : 0.18);
  }

  private flashTouchButton(button: Phaser.GameObjects.Container): void {
    const halo = button.list[0] as Phaser.GameObjects.Arc | undefined;
    if (!halo) return;
    this.scene.tweens.killTweensOf([button, halo]);
    button.setScale(0.9);
    halo.setAlpha(0.62).setScale(1.14);
    this.scene.tweens.add({ targets: button, scale: 1, duration: 150, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: halo, alpha: 0.18, scale: 1, duration: 220, ease: 'Quad.Out' });
  }

  private setTouchDirectionPressed(button: Phaser.GameObjects.Container, pressed: boolean): void {
    button.setScale(pressed ? 0.92 : 1);
    const background = button.list[0] as Phaser.GameObjects.Rectangle | undefined;
    const highlight = button.list[1] as Phaser.GameObjects.Rectangle | undefined;
    background?.setFillStyle(pressed ? 0xf7c84b : 0x354d7d, 0.98).setStrokeStyle(2, pressed ? 0xfff0a8 : 0x9bb6e8, 1);
    highlight?.setAlpha(pressed ? 0.48 : 0.28);
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

  /** Distinguishes a gameplay tap from a tap on an on-screen control. */
  public isTouchPointOverControl(x: number, y: number): boolean {
    return [this.touchPad, this.touchAction, this.touchTerminal].some((control) => {
      if (!control || !control.visible) return false;
      return control.getBounds().contains(x, y);
    });
  }

  private onTouchMove?: (vector: Point) => void;

  public setTouchMoveHandler(handler: (vector: Point) => void): void { this.onTouchMove = handler; }

}
