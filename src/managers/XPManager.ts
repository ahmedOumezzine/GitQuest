export interface XPState { total: number; }

export class XPManager {
  public constructor(private total = 0) {}
  public add(amount: number): number { this.total += Math.max(0, amount); return this.total; }
  public get value(): number { return this.total; }
  public toJSON(): XPState { return { total: this.total }; }
  public restore(state?: XPState): void { this.total = state?.total ?? 0; }
}
