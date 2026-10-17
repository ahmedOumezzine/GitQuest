import type { LevelDefinition, Locale, TouchControlsMode } from '../models/game';
import { InventoryManager } from '../managers/InventoryManager';
import { XPManager } from '../managers/XPManager';
import { QuestManager } from '../managers/QuestManager';
import { SaveManager } from '../managers/SaveManager';
import { GitSimulator } from '../systems/GitSimulator';

export class GameSession {
  public readonly inventory = new InventoryManager();
  public readonly xp = new XPManager();
  public git = new GitSimulator();
  public locale: Locale = 'fr';
  public touchControlsMode: TouchControlsMode = 'auto';
  public levelId = 'level-01';
  public readonly collectedObjects: Record<string, string[]> = {};
  public hadExistingSave = false;
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
  }

  public hasCollected(levelId: string, objectId: string): boolean { return this.collectedObjects[levelId]?.includes(objectId) ?? false; }
  public shouldShowTouchControls(): boolean {
    if (this.touchControlsMode === 'always') return true;
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const fine = window.matchMedia?.('(pointer: fine)').matches ?? false;
    return coarse && !fine;
  }
  public collectObject(levelId: string, objectId: string): void { this.collectedObjects[levelId] ??= []; if (!this.collectedObjects[levelId].includes(objectId)) this.collectedObjects[levelId].push(objectId); }
  public reset(): void {
    this.levelId = 'level-01';
    this.inventory.restore({ items: [] });
    this.xp.restore({ total: 0 });
    this.git = new GitSimulator();
    this.quests.clear();
    Object.keys(this.pendingQuestStates).forEach((key) => delete this.pendingQuestStates[key]);
    Object.keys(this.collectedObjects).forEach((key) => delete this.collectedObjects[key]);
  }

  public save(): void {
    const quests: Record<string, ReturnType<QuestManager['toJSON']>> = {};
    for (const [id, quest] of this.quests) quests[id] = quest.toJSON();
    this.saveManager.save({ levelId: this.levelId, locale: this.locale, touchControlsMode: this.touchControlsMode, inventory: this.inventory.toJSON(), xp: this.xp.toJSON(), quests, collectedObjects: this.collectedObjects, git: this.git.toJSON() });
  }
}
