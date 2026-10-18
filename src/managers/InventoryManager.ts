export interface InventoryState {
  /** Legacy saves keep this flat list; quantities is optional for migration. */
  items: string[];
  quantities?: Record<string, number>;
}

export class InventoryManager {
  private readonly quantities = new Map<string, number>();

  public add(itemId: string, amount = 1): boolean {
    if (!itemId || amount <= 0) return false;
    const before = this.quantity(itemId);
    this.quantities.set(itemId, before + amount);
    return before === 0;
  }

  public remove(itemId: string, amount = 1): boolean {
    const before = this.quantity(itemId);
    if (before <= 0 || amount <= 0) return false;
    if (before <= amount) this.quantities.delete(itemId);
    else this.quantities.set(itemId, before - amount);
    return true;
  }

  public has(itemId: string): boolean { return this.quantity(itemId) > 0; }
  public quantity(itemId: string): number { return this.quantities.get(itemId) ?? 0; }
  public list(): string[] { return [...this.quantities.keys()]; }
  public quantitiesJSON(): Record<string, number> { return Object.fromEntries(this.quantities); }
  public toJSON(): InventoryState { return { items: this.list(), quantities: this.quantitiesJSON() }; }
  public restore(state?: InventoryState): void {
    this.quantities.clear();
    if (state?.quantities) {
      Object.entries(state.quantities).forEach(([item, amount]) => {
        if (amount > 0) this.quantities.set(item, amount);
      });
      return;
    }
    state?.items?.forEach((item) => this.add(item));
  }
}
