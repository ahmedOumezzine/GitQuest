export interface InventoryState {
  /** Legacy saves keep this flat list; quantities is optional for migration. */
  items: string[];
  quantities?: Record<string, number>;
  equipped?: Record<string, string>;
}

export class InventoryManager {
  private readonly quantities = new Map<string, number>();
  private readonly equipped = new Map<string, string>();

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
  public equip(itemId: string, slot: string): boolean {
    if (!this.has(itemId) || !slot) return false;
    this.equipped.set(slot, itemId);
    return true;
  }
  public unequip(slot: string): boolean { return this.equipped.delete(slot); }
  public isEquipped(itemId: string): boolean { return [...this.equipped.values()].includes(itemId); }
  public equippedJSON(): Record<string, string> { return Object.fromEntries(this.equipped); }
  public toJSON(): InventoryState { return { items: this.list(), quantities: this.quantitiesJSON(), equipped: this.equippedJSON() }; }
  public restore(state?: InventoryState): void {
    this.quantities.clear();
    this.equipped.clear();
    if (state?.quantities) {
      Object.entries(state.quantities).forEach(([item, amount]) => {
        if (amount > 0) this.quantities.set(item, amount);
      });
      Object.entries(state.equipped ?? {}).forEach(([slot, item]) => {
        if (this.has(item)) this.equipped.set(slot, item);
      });
      return;
    }
    state?.items?.forEach((item) => this.add(item));
    Object.entries(state?.equipped ?? {}).forEach(([slot, item]) => {
      if (this.has(item)) this.equipped.set(slot, item);
    });
  }
}
