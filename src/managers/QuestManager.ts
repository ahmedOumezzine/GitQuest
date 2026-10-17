import type { GitOperation, QuestDefinition, QuestStepKind } from '../models/game';
import type { GitCommandResult } from '../systems/GitSimulator';

export interface QuestState { completedStepIds: string[]; }

export class QuestManager {
  private readonly completed = new Set<string>();

  public constructor(public readonly definition: QuestDefinition) {}

  public get currentStep() { return this.definition.steps.find((step) => !this.completed.has(step.id)); }
  public get isComplete(): boolean { return !this.currentStep; }

  public acceptDialogue(dialogueId: string): boolean {
    return this.acceptStep('dialogue', (step) => step.dialogueId === dialogueId);
  }

  public acceptGit(result: GitCommandResult, operation: GitOperation): boolean {
    return this.acceptStep('git-command', (step) => step.operation === operation && result.ok && result.stateChanged);
  }

  public acceptCollection(objectId: string): boolean {
    return this.acceptStep('collect', (step) => step.objectId === objectId);
  }

  public acceptExit(): boolean {
    return this.acceptStep('open-exit', () => true);
  }

  public toJSON(): QuestState { return { completedStepIds: [...this.completed] }; }
  public restore(state?: QuestState): void { state?.completedStepIds?.forEach((id) => this.completed.add(id)); }
  public hasCompleted(stepId: string): boolean { return this.completed.has(stepId); }

  private acceptStep(kind: QuestStepKind, predicate: (step: NonNullable<typeof this.currentStep>) => boolean): boolean {
    const step = this.currentStep;
    if (!step || step.kind !== kind || !predicate(step)) return false;
    this.completed.add(step.id);
    return true;
  }
}
