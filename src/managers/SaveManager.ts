import type { Locale, TouchControlsMode } from '../models/game';
import type { GitSimulatorState } from '../systems/GitSimulator';
import type { InventoryState } from './InventoryManager';
import type { QuestState } from './QuestManager';
import type { XPState } from './XPManager';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'gitquest-save';

export type SaveErrorKind = 'read' | 'write' | 'clear' | 'corrupt';
export interface SaveError { kind: SaveErrorKind; message: string; }

export interface SaveData {
  version: number;
  levelId: string;
  locale: Locale;
  touchControlsMode?: TouchControlsMode;
  inventory: InventoryState;
  xp: XPState;
  quests: Record<string, QuestState>;
  collectedObjects: Record<string, string[]>;
  discoveredSecrets?: Record<string, string[]>;
  git: GitSimulatorState;
}

export class SaveManager {
  public lastError: SaveError | null = null;
  public constructor(private readonly storage: Storage | undefined = globalThis.localStorage) {}
  public save(data: Omit<SaveData, 'version'>): boolean {
    this.lastError = null;
    if (!this.storage) return true;
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
      return true;
    } catch (error) {
      this.lastError = { kind: 'write', message: error instanceof Error ? error.message : String(error) };
      return false;
    }
  }
  public load(): SaveData | null {
    this.lastError = null;
    if (!this.storage) return null;
    let raw: string | null;
    try {
      raw = this.storage.getItem(SAVE_KEY);
    } catch (error) {
      this.lastError = { kind: 'read', message: error instanceof Error ? error.message : String(error) };
      return null;
    }
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (parsed.version !== SAVE_VERSION) return this.migrate(parsed);
      if (!this.isSaveShape(parsed)) throw new Error('Structure de sauvegarde invalide.');
      return parsed as SaveData;
    } catch (error) {
      this.lastError = { kind: 'corrupt', message: error instanceof Error ? error.message : String(error) };
      return null;
    }
  }
  public clear(): boolean {
    this.lastError = null;
    if (!this.storage) return true;
    try { this.storage.removeItem(SAVE_KEY); return true; }
    catch (error) { this.lastError = { kind: 'clear', message: error instanceof Error ? error.message : String(error) }; return false; }
  }
  private isSaveShape(data: Partial<SaveData>): boolean {
    return data.version === SAVE_VERSION && typeof data.levelId === 'string' &&
      (data.locale === 'fr' || data.locale === 'en' || data.locale === 'ar') &&
      !!data.inventory && Array.isArray(data.inventory.items) && !!data.xp &&
      typeof data.xp.total === 'number' && !!data.quests && !!data.collectedObjects && !!data.git;
  }
  private migrate(data: Partial<SaveData>): SaveData {
    return {
      version: SAVE_VERSION,
      levelId: data.levelId ?? 'level-01',
      locale: data.locale ?? 'fr',
      touchControlsMode: data.touchControlsMode ?? 'auto',
      inventory: data.inventory ?? { items: [] },
      xp: data.xp ?? { total: 0 },
      quests: data.quests ?? {},
      collectedObjects: data.collectedObjects ?? {},
      discoveredSecrets: data.discoveredSecrets ?? {},
      git: data.git ?? { version: 1, initialized: false, files: { 'notes.txt': 'Une idée naît sur l’île.' }, staged: [], commits: [], currentBranch: 'main', branches: { main: [] }, remoteCommits: [], conflicts: [] },
    };
  }
}
