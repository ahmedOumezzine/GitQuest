import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
import type { Point } from '../models/game';
import { calculateTouchLayout, TOUCH_LAYOUT_SIZES, type LayoutMetrics } from '../ui/layout/ResponsiveLayoutManager';
import { interactionKeyEvents, terminalKeyEvent } from './InputBindings';
import { clampJoystickOffset, joystickVectorFromOffset } from './MobileControlsMath';

/**
 * Shared keyboard and mobile input adapter.
 *
 * The world only receives vectors and semantic actions. It never knows if a
 * player used a keyboard, the analog stick, or an action button, which keeps
 * the six data-driven levels independent from the mobile UI.
 */
export class InputManager {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private touchAction?: Phaser.GameObjects.Container;
  private touchTerminal?: Phaser.GameObjects.Container;
  private touchPad?: Phaser.GameObjects.Container;
  private touchJoystickKnob?: Phaser.GameObjects.Container;
  private touchJoystickPointerId: number | null = null;
  private touchControlsVisible = false;
  private touchInteract?: () => void;
  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.touchControlsVisible) return;
    if (this.isPointInControl(pointer, this.touchPad, TOUCH_LAYOUT_SIZES.joystickHitRadius)) {
      this.handleJoystickDown(pointer);
      return;
    }
    if (this.isPointInControl(pointer, this.touchAction, TOUCH_LAYOUT_SIZES.actionHitRadius)) {
      this.pressTouchButton(this.touchAction);
      audioManager.play('touch');
      this.touchInteract?.();
      return;
    }
    if (this.isPointInControl(pointer, this.touchTerminal, TOUCH_LAYOUT_SIZES.actionHitRadius)) {
      this.pressTouchButton(this.touchTerminal);
      audioManager.play('touch');
      this.onTerminal();
    }
  };
  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.touchControlsVisible || this.touchJoystickPointerId !== pointer.id) return;
    this.updateJoystick(pointer);
  };
  private readonly onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (this.touchJoystickPointerId === pointer.id) this.resetJoystick();
  };

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
      this.removePointerListeners();
      this.resetJoystick();
      this.touchPad?.destroy(true);
      this.touchAction?.destroy(true);
      this.touchTerminal?.destroy(true);
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

  /** Builds one analog stick and two semantic action buttons. */
  public bindTouch(
    _legacyButtons: Array<{ label: string; x: number; y: number; vector: Point }>,
    interact: () => void,
    labels = { interact: 'Interact', terminal: 'Terminal' },
  ): void {
    this.touchInteract = interact;
    this.touchPad?.destroy(true);
    this.touchAction?.destroy(true);
    this.touchTerminal?.destroy(true);

    this.touchPad = this.scene.add.container(0, 0).setDepth(30);
    const shadow = this.scene.add.circle(3, 5, TOUCH_LAYOUT_SIZES.joystickRadius, 0x081126, 0.38);
    const outer = this.scene.add.circle(0, 0, TOUCH_LAYOUT_SIZES.joystickRadius, 0x18233e, 0.58)
      .setStrokeStyle(2, 0xf7d56a, 0.78);
    const inner = this.scene.add.circle(0, 0, TOUCH_LAYOUT_SIZES.joystickRadius - 10, 0x23375f, 0.42)
      .setStrokeStyle(1, 0x9bb6e8, 0.45);
    const centerMark = this.scene.add.circle(0, 0, 3, 0xf7d56a, 0.72);
    const knobShadow = this.scene.add.circle(2, 4, 18, 0x081126, 0.48);
    const knob = this.scene.add.circle(0, 0, 17, 0x354d7d, 0.96)
      .setStrokeStyle(2, 0xfff0a8, 0.96);
    const knobHighlight = this.scene.add.circle(-5, -6, 4, 0xfff6df, 0.42);
    this.touchJoystickKnob = this.scene.add.container(0, 0).setName('joystick-knob');
    this.touchJoystickKnob.add([knobShadow, knob, knobHighlight]);
    this.touchPad.add([shadow, outer, inner, centerMark, this.touchJoystickKnob]);
    this.touchPad.setSize(TOUCH_LAYOUT_SIZES.joystickHitRadius * 2, TOUCH_LAYOUT_SIZES.joystickHitRadius * 2);
    this.touchPad.setInteractive(
      new Phaser.Geom.Circle(0, 0, TOUCH_LAYOUT_SIZES.joystickHitRadius),
      Phaser.Geom.Circle.Contains,
    );

    const hitArea = new Phaser.Geom.Circle(0, 0, TOUCH_LAYOUT_SIZES.actionHitRadius);
    this.touchAction = this.createTouchAction('…', labels.interact, 0xf7c84b, 0x18233e, hitArea);
    this.bindTouchRelease(this.touchAction);

    this.touchTerminal = this.createTouchAction('>_', labels.terminal, 0x18233e, 0xfff6df, hitArea);
    this.bindTouchRelease(this.touchTerminal);

    this.scene.input.on('pointerdown', this.onPointerDown);
    this.scene.input.on('pointermove', this.onPointerMove);
    this.scene.input.on('pointerup', this.onPointerUp);
    this.scene.input.on('pointerupoutside', this.onPointerUp);
    this.scene.input.on('pointercancel', this.onPointerUp);
    this.setTouchControlsVisible(this.touchControlsVisible);
  }

  private readonly handleJoystickDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.touchControlsVisible || this.touchJoystickPointerId !== null) return;
    this.touchJoystickPointerId = pointer.id;
    audioManager.play('touch');
    this.updateJoystick(pointer);
  };

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    if (!this.touchPad || !this.touchJoystickKnob) return;
    const offset = { x: pointer.x - this.touchPad.x, y: pointer.y - this.touchPad.y };
    const knobOffset = clampJoystickOffset(offset, TOUCH_LAYOUT_SIZES.joystickRadius - 18);
    const vector = joystickVectorFromOffset(offset, TOUCH_LAYOUT_SIZES.joystickRadius - 6, 10);
    this.touchJoystickKnob.setPosition(knobOffset.x, knobOffset.y);
    this.onTouchMove?.(vector);
  }

  private resetJoystick(): void {
    this.touchJoystickPointerId = null;
    this.touchJoystickKnob?.setPosition(0, 0);
    this.onTouchMove?.({ x: 0, y: 0 });
  }

  private removePointerListeners(): void {
    this.scene.input.off('pointerdown', this.onPointerDown);
    this.scene.input.off('pointermove', this.onPointerMove);
    this.scene.input.off('pointerup', this.onPointerUp);
    this.scene.input.off('pointerupoutside', this.onPointerUp);
    this.scene.input.off('pointercancel', this.onPointerUp);
  }

  private isPointInControl(pointer: Phaser.Input.Pointer, control: Phaser.GameObjects.Container | undefined, radius: number): boolean {
    if (!control || !control.visible) return false;
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, control.x, control.y) <= radius;
  }

  private createTouchAction(icon: string, caption: string, fill: number, textColor: number, hitArea: Phaser.Geom.Circle): Phaser.GameObjects.Container {
    const button = this.scene.add.container(0, 0).setDepth(30);
    const halo = this.scene.add.circle(0, 0, TOUCH_LAYOUT_SIZES.actionRadius + 8, fill, 0.16)
      .setStrokeStyle(2, fill === 0xf7c84b ? 0xfff0a8 : 0x9bb6e8, 0.58);
    const circle = this.scene.add.circle(0, 0, TOUCH_LAYOUT_SIZES.actionRadius, fill, 0.94)
      .setStrokeStyle(2, fill === 0xf7c84b ? 0xfff0a8 : 0x9bb6e8, 0.96);
    const ring = this.scene.add.circle(0, 0, TOUCH_LAYOUT_SIZES.actionRadius - 7, fill, 0)
      .setStrokeStyle(1, 0xffffff, 0.24);
    const textColorHex = Phaser.Display.Color.IntegerToColor(textColor).rgba;
    const iconText = this.scene.add.text(0, -2, icon, {
      fontFamily: 'Courier New, monospace',
      fontSize: icon === '>_' ? '17px' : '22px',
      color: textColorHex,
      stroke: '#10172b',
      strokeThickness: 1,
    }).setOrigin(0.5);
    const labelText = this.scene.add.text(0, 42, caption, {
      fontFamily: 'Courier New, monospace',
      fontSize: '9px',
      color: '#fff6df',
      backgroundColor: '#10172b',
      padding: { x: 5, y: 2 },
      stroke: '#10172b',
      strokeThickness: 1,
      align: 'center',
    }).setName('touch-caption').setOrigin(0.5);
    button.add([halo, circle, ring, iconText, labelText]);
    button.setSize(TOUCH_LAYOUT_SIZES.actionHitRadius * 2, TOUCH_LAYOUT_SIZES.actionHitRadius * 2);
    button.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    return button;
  }

  private bindTouchRelease(button: Phaser.GameObjects.Container): void {
    const release = () => this.setTouchButtonPressed(button, false);
    button.on('pointerup', release);
    button.on('pointerupoutside', release);
  }

  private pressTouchButton(button: Phaser.GameObjects.Container | undefined): void {
    if (!button) return;
    this.setTouchButtonPressed(button, true);
    this.flashTouchButton(button);
  }

  private setTouchButtonPressed(button: Phaser.GameObjects.Container | undefined, pressed: boolean): void {
    if (!button) return;
    button.setScale(pressed ? 0.92 : 1);
    const halo = button.list[0] as Phaser.GameObjects.Arc | undefined;
    halo?.setAlpha(pressed ? 0.4 : 0.16);
  }

  private flashTouchButton(button: Phaser.GameObjects.Container): void {
    const halo = button.list[0] as Phaser.GameObjects.Arc | undefined;
    if (!halo) return;
    this.scene.tweens.killTweensOf([button, halo]);
    button.setScale(0.9);
    halo.setAlpha(0.58).setScale(1.12);
    this.scene.tweens.add({ targets: button, scale: 1, duration: 140, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: halo, alpha: 0.16, scale: 1, duration: 220, ease: 'Quad.Out' });
  }

  public layoutTouch(metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin'>): void {
    const layout = calculateTouchLayout(metrics);
    this.touchPad?.setPosition(layout.joystick.x, layout.joystick.y);
    this.touchAction?.setPosition(layout.action.x, layout.action.y);
    this.touchTerminal?.setPosition(layout.terminal.x, layout.terminal.y);
    this.resetJoystick();
  }

  public setTouchLabels(labels: { interact: string; terminal: string }): void {
    const actionLabel = this.touchAction?.getByName('touch-caption') as Phaser.GameObjects.Text | undefined;
    const terminalLabel = this.touchTerminal?.getByName('touch-caption') as Phaser.GameObjects.Text | undefined;
    actionLabel?.setText(labels.interact);
    terminalLabel?.setText(labels.terminal);
  }

  /** Hides all touch controls while a modal panel owns the input focus. */
  public setTouchControlsVisible(visible: boolean): void {
    this.touchControlsVisible = visible;
    [this.touchPad, this.touchAction, this.touchTerminal].forEach((control) => control?.setVisible(visible));
    if (!visible) this.resetJoystick();
  }

  /** Distinguishes a gameplay tap from a tap on an on-screen control. */
  public isTouchPointOverControl(x: number, y: number, includeHidden = false): boolean {
    return [this.touchPad, this.touchAction, this.touchTerminal].some((control) => {
      if (!control || (!includeHidden && !control.visible)) return false;
      return control.getBounds().contains(x, y);
    });
  }

  private onTouchMove?: (vector: Point) => void;

  public setTouchMoveHandler(handler: (vector: Point) => void): void { this.onTouchMove = handler; }

}
