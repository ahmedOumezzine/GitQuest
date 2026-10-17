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
