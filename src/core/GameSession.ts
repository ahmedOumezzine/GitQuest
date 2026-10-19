import type { LevelDefinition, Locale, TouchControlsMode } from '../models/game';
import { InventoryManager } from '../managers/InventoryManager';
import { XPManager } from '../managers/XPManager';
import { QuestManager } from '../managers/QuestManager';
import { SaveManager, type SaveError } from '../managers/SaveManager';
import { GitSimulator } from '../systems/GitSimulator';
import { itemDefinition } from '../data/ItemCatalog';

export class GameSession {
  public readonly inventory = new InventoryManager();
  public readonly xp = new XPManager();
  public git = new GitSimulator();
  public locale: Locale = 'fr';
  public touchControlsMode: TouchControlsMode = 'auto';
  public levelId = 'level-01';
  public readonly collectedObjects: Record<string, string[]> = {};
  public readonly discoveredSecrets: Record<string, string[]> = {};
  public hadExistingSave = false;
  public saveError: SaveError | null = null;
  private readonly pendingQuestStates: Record<string, ReturnType<QuestManager['toJSON']>> = {};
  private readonly quests = new Map<string, QuestManager>();

  public constructor(private readonly saveManager = new SaveManager()) {}

  public createQuest(level: LevelDefinition): QuestManager {
    const existing = this.quests.get(level.id);
    if (existing) return existing;
    const quest = new QuestManager(level.quest);
    quest.restore(this.pendingQuestStates[level.id]);
    this.quests.set(level.id, quest);
    return quest;
  }

  public getQuest(levelId: string): QuestManager | undefined { return this.quests.get(levelId); }

  public load(): void {
    const save = this.saveManager.load();
    this.saveError = this.saveManager.lastError;
    if (!save) return;
    this.hadExistingSave = true;
    this.levelId = save.levelId;
    this.locale = save.locale;
    this.touchControlsMode = save.touchControlsMode ?? 'auto';
    this.inventory.restore(save.inventory);
    this.xp.restore(save.xp);
    this.git.restore(save.git);
    Object.assign(this.pendingQuestStates, save.quests);
    Object.assign(this.collectedObjects, save.collectedObjects);
    Object.assign(this.discoveredSecrets, save.discoveredSecrets ?? {});
  }

  public hasCollected(levelId: string, objectId: string): boolean { return this.collectedObjects[levelId]?.includes(objectId) ?? false; }
  public hasDiscoveredSecret(levelId: string, objectId: string): boolean { return this.discoveredSecrets[levelId]?.includes(objectId) ?? false; }
  public shouldShowTouchControls(): boolean {
    if (this.touchControlsMode === 'always') return true;
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const touchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0;
    // A touchscreen laptop can expose both a fine mouse pointer and touch.
    // Width alone is not a reliable device test, so keep controls enabled for
    // real touch hardware while leaving ordinary desktop mouse/keyboard use
    // clean by default.
    return coarse || touchPoints > 0;
  }
  public collectObject(levelId: string, objectId: string): void { this.collectedObjects[levelId] ??= []; if (!this.collectedObjects[levelId].includes(objectId)) this.collectedObjects[levelId].push(objectId); }
  public discoverSecret(levelId: string, objectId: string): boolean {
    this.discoveredSecrets[levelId] ??= [];
    if (this.discoveredSecrets[levelId].includes(objectId)) return false;
    this.discoveredSecrets[levelId].push(objectId);
    return true;
  }
  public useItem(itemId: string): number {
    const definition = itemDefinition(itemId);
    if (definition.category !== 'consumable' || !this.inventory.remove(itemId)) return 0;
    const reward = definition.useXp ?? 0;
    if (reward > 0) this.xp.add(reward);
    return reward;
  }
  public reset(): void {
    this.levelId = 'level-01';
    this.inventory.restore({ items: [] });
    this.xp.restore({ total: 0 });
    this.git = new GitSimulator();
    this.quests.clear();
    Object.keys(this.pendingQuestStates).forEach((key) => delete this.pendingQuestStates[key]);
    Object.keys(this.collectedObjects).forEach((key) => delete this.collectedObjects[key]);
    Object.keys(this.discoveredSecrets).forEach((key) => delete this.discoveredSecrets[key]);
  }

  public save(): void {
    const quests: Record<string, ReturnType<QuestManager['toJSON']>> = {};
    for (const [id, quest] of this.quests) quests[id] = quest.toJSON();
    const saved = this.saveManager.save({ levelId: this.levelId, locale: this.locale, touchControlsMode: this.touchControlsMode, inventory: this.inventory.toJSON(), xp: this.xp.toJSON(), quests, collectedObjects: this.collectedObjects, discoveredSecrets: this.discoveredSecrets, git: this.git.toJSON() });
    this.saveError = saved ? null : this.saveManager.lastError;
  }
}
