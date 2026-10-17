import type { Locale, TouchControlsMode } from '../models/game';
import type { GitSimulatorState } from '../systems/GitSimulator';
import type { InventoryState } from './InventoryManager';
import type { QuestState } from './QuestManager';
import type { XPState } from './XPManager';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'gitquest-save';

export interface SaveData {
  version: number;
  levelId: string;
  locale: Locale;
  touchControlsMode?: TouchControlsMode;
  inventory: InventoryState;
  xp: XPState;
  quests: Record<string, QuestState>;
  collectedObjects: Record<string, string[]>;
  git: GitSimulatorState;
}

export class SaveManager {
  public constructor(private readonly storage: Storage | undefined = globalThis.localStorage) {}
  public save(data: Omit<SaveData, 'version'>): void { this.storage?.setItem(SAVE_KEY, JSON.stringify({ ...data, version: SAVE_VERSION })); }
  public load(): SaveData | null {
    const raw = this.storage?.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (parsed.version !== SAVE_VERSION) return this.migrate(parsed);
    return parsed as SaveData;
  }
  public clear(): void { this.storage?.removeItem(SAVE_KEY); }
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
      git: data.git ?? { version: 1, initialized: false, files: { 'notes.txt': 'Une idée naît sur l’île.' }, staged: [], commits: [], currentBranch: 'main', branches: { main: [] }, remoteCommits: [], conflicts: [] },
    };
  }
}
