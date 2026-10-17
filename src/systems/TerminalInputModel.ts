export class TerminalInputModel {
  private current = '';
  private history: string[] = [];
  private historyIndex = -1;

  public get value(): string { return this.current; }

  public setValue(value: string): void { this.current = value; }

  public clear(): void {
    this.current = '';
    this.historyIndex = -1;
  }

  public remember(command: string): void {
    this.history = [...this.history.filter((item) => item !== command), command].slice(-20);
    this.historyIndex = -1;
  }

  public moveHistory(direction: -1 | 1): string {
    if (!this.history.length) return this.current;
    // -1 signifie « commande courante ». ArrowUp doit donc avancer dans
    // l’historique tandis qu’ArrowDown revient vers l’entrée vide.
    this.historyIndex = Math.max(-1, Math.min(this.history.length - 1, this.historyIndex - direction));
    this.current = this.historyIndex < 0 ? '' : this.history[this.history.length - 1 - this.historyIndex];
    return this.current;
  }
}
