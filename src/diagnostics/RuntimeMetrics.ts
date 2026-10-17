export interface RuntimeMetricsSnapshot {
  fps: number;
  frameTimeMs: number;
  sampleDurationMs: number;
  sampleFrames: number;
}

export class RuntimeMetrics {
  private sampleStart: number | null = null;
  private sampleFrames = 0;
  private snapshotValue: RuntimeMetricsSnapshot = { fps: 0, frameTimeMs: 0, sampleDurationMs: 0, sampleFrames: 0 };

  public frame(now: number): void {
    if (this.sampleStart === null) {
      this.sampleStart = now;
      return;
    }
    this.sampleFrames += 1;
    const elapsed = now - this.sampleStart;
    if (elapsed < 1000) return;
    const fps = this.sampleFrames * 1000 / elapsed;
    this.snapshotValue = {
      fps,
      frameTimeMs: 1000 / fps,
      sampleDurationMs: elapsed,
      sampleFrames: this.sampleFrames,
    };
    this.sampleStart = now;
    this.sampleFrames = 0;
  }

  public snapshot(): RuntimeMetricsSnapshot { return { ...this.snapshotValue }; }
}

declare global {
  interface Window { __gitquestRuntimeMetrics?: RuntimeMetrics; }
}
