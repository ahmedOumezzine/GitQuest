import type Phaser from 'phaser';

export type LayoutAnchor = 'top-left' | 'top-right' | 'top-center' | 'center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface LayoutMetrics extends ViewportSize {
  portrait: boolean;
  compact: boolean;
  margin: number;
  topBarHeight: number;
  safe: { left: number; right: number; top: number; bottom: number };
}

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TouchLayout {
  joystick: { x: number; y: number };
  action: { x: number; y: number };
  terminal: { x: number; y: number };
}

export interface GameplayHudLayout {
  quest: { x: number; y: number; width: number };
  xp: { x: number; y: number };
  inventory: { x: number; y: number };
}

/** Returns the smallest zoom that covers the complete browser surface. */
export function calculateCoverZoom(viewport: ViewportSize, world: ViewportSize, minimum = 1): number {
  return Math.max(
    minimum,
    viewport.width / Math.max(1, world.width),
    viewport.height / Math.max(1, world.height),
  );
}

/** Visual and hit-area sizes shared by the responsive layout and its tests. */
export const TOUCH_LAYOUT_SIZES = {
  joystickRadius: 52,
  joystickHitRadius: 64,
  actionRadius: 28,
  actionHitRadius: 38,
  actionLabelBottom: 52,
} as const;

export function calculateTouchLayout(metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin'>): TouchLayout {
  // Keep the circular controls inside a safe area. These coordinates are
  // scene coordinates and are recalculated by ResponsiveLayoutManager after
  // every resize/orientation change.
  const portrait = metrics.height > metrics.width;
  const joystick = {
    x: metrics.margin + TOUCH_LAYOUT_SIZES.joystickHitRadius,
    y: metrics.height - metrics.margin - TOUCH_LAYOUT_SIZES.joystickHitRadius,
  };
  const action = {
    x: metrics.width - metrics.margin - TOUCH_LAYOUT_SIZES.actionHitRadius,
    y: metrics.height - metrics.margin - TOUCH_LAYOUT_SIZES.actionLabelBottom,
  };
  return { joystick, action, terminal: { x: action.x, y: action.y - 84 } };
}

export function calculateGameplayHudLayout(
  metrics: Pick<LayoutMetrics, 'width' | 'height' | 'margin' | 'topBarHeight' | 'compact' | 'portrait'>,
  questWidth: number,
  xpWidth: number,
  inventoryWidth: number,
): GameplayHudLayout {
  const margin = metrics.margin;
  if (metrics.portrait) {
    const fullWidth = Math.max(220, metrics.width - margin * 2);
    // The mission card is collapsed to two readable lines by default. XP and
    // inventory share the second compact row instead of creating a tall HUD.
    const rowY = 72;
    return {
      quest: { x: margin, y: 8, width: fullWidth },
      xp: { x: margin, y: rowY },
      inventory: { x: metrics.width - margin - inventoryWidth, y: rowY },
    };
  }

  if (metrics.compact) {
    const rightWidth = Math.max(xpWidth, inventoryWidth);
    const questWidth = Math.max(220, metrics.width - margin * 2 - rightWidth - 12);
    const rightX = metrics.width - margin - rightWidth;
    return {
      quest: { x: margin, y: 8, width: questWidth },
      xp: { x: rightX, y: 8 },
      inventory: { x: rightX, y: 48 },
    };
  }

  const resolvedQuestWidth = metrics.compact
    ? Math.max(220, metrics.width - margin * 2)
    : Math.min(380, Math.max(220, questWidth));
  const rightX = metrics.width - margin;
  return {
    // Desktop cards sit directly over the world instead of reserving an
    // opaque top strip for the HUD.
    quest: { x: margin, y: metrics.compact ? 8 : 12, width: resolvedQuestWidth },
    xp: { x: rightX - xpWidth, y: metrics.compact ? 8 : 12 },
    inventory: { x: rightX - inventoryWidth, y: metrics.compact ? 48 : 54 },
  };
}

export function calculateMenuCenterY(metrics: Pick<LayoutMetrics, 'height' | 'margin' | 'compact' | 'portrait'>, totalHeight: number): number {
  const preferredCenterY = metrics.compact && !metrics.portrait
    ? metrics.height - metrics.margin - totalHeight / 2
    : metrics.height * (metrics.portrait ? 0.68 : 0.62);
  return Math.min(metrics.height - metrics.margin - totalHeight / 2, preferredCenterY);
}

export function calculateLayout(width: number, height: number): LayoutMetrics {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const portrait = safeHeight > safeWidth;
  const compact = safeWidth < 760 || safeHeight < 500;
  const margin = compact ? 12 : 20;
  const topBarHeight = portrait ? 118 : compact ? 88 : 64;
  return {
    width: safeWidth,
    height: safeHeight,
    portrait,
    compact,
    margin,
    topBarHeight,
    safe: { left: margin, right: margin, top: margin, bottom: margin },
  };
}

export class ResponsiveLayoutManager {
  private readonly resizeHandlers: Array<(metrics: LayoutMetrics) => void> = [];
  private metrics: LayoutMetrics;

  public constructor(private readonly scene: Phaser.Scene) {
    this.metrics = calculateLayout(scene.scale.width, scene.scale.height);
    scene.scale.on('resize', this.handleResize, this);
    scene.events.once('shutdown', this.destroy, this);
  }

  public get current(): LayoutMetrics { return this.metrics; }

  public onResize(handler: (metrics: LayoutMetrics) => void): this {
    this.resizeHandlers.push(handler);
    handler(this.metrics);
    return this;
  }

  public anchor(anchor: LayoutAnchor, size: { width?: number; height?: number } = {}, margin = this.metrics.margin): { x: number; y: number } {
    const width = size.width ?? 0;
    const height = size.height ?? 0;
    const { width: viewportWidth, height: viewportHeight } = this.metrics;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    switch (anchor) {
      case 'top-left': return { x: margin + width / 2, y: margin + height / 2 };
      case 'top-right': return { x: viewportWidth - margin - width / 2, y: margin + height / 2 };
      case 'top-center': return { x: centerX, y: margin + height / 2 };
      case 'bottom-left': return { x: margin + width / 2, y: viewportHeight - margin - height / 2 };
      case 'bottom-right': return { x: viewportWidth - margin - width / 2, y: viewportHeight - margin - height / 2 };
      case 'bottom-center': return { x: centerX, y: viewportHeight - margin - height / 2 };
      default: return { x: centerX, y: centerY };
    }
  }

  public rect(anchor: LayoutAnchor, width: number, height: number, margin = this.metrics.margin): LayoutRect {
    const point = this.anchor(anchor, { width, height }, margin);
    return { x: point.x - width / 2, y: point.y - height / 2, width, height };
  }

  public destroy(): void {
    this.scene.scale.off('resize', this.handleResize, this);
    this.scene.events.off('shutdown', this.destroy, this);
    this.resizeHandlers.length = 0;
  }

  private handleResize(widthOrSize: number | Phaser.Structs.Size, height?: number): void {
    const width = typeof widthOrSize === 'number' ? widthOrSize : widthOrSize.width;
    const nextHeight = typeof widthOrSize === 'number' ? (height ?? this.scene.scale.height) : widthOrSize.height;
    this.metrics = calculateLayout(width, nextHeight);
    this.resizeHandlers.forEach((handler) => handler(this.metrics));
  }
}
