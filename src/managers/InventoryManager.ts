export interface InventoryState { items: string[]; }

export class InventoryManager {
  private readonly items = new Set<string>();

  public add(itemId: string): boolean { const before = this.items.size; this.items.add(itemId); return this.items.size > before; }
  public remove(itemId: string): boolean { return this.items.delete(itemId); }
  public has(itemId: string): boolean { return this.items.has(itemId); }
  public list(): string[] { return [...this.items]; }
  public toJSON(): InventoryState { return { items: this.list() }; }
  public restore(state?: InventoryState): void { this.items.clear(); state?.items?.forEach((item) => this.items.add(item)); }
}
