/** Opt-in runtime state exposed only while a QA query parameter is present. */
export function markQaState(state: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestQa = state;
}

export function markQaLevel(levelId: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestLevel = levelId;
}

export function markQaTouchControls(visible: boolean): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestTouchControls = visible ? 'visible' : 'hidden';
}

export function markQaQuestStep(stepId?: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestQuestStep = stepId ?? 'complete';
}

export function markQaPlayerPosition(x: number, y: number): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestPlayerX = x.toFixed(1);
  document.documentElement.dataset.gitquestPlayerY = y.toFixed(1);
}

export function markQaDialogue(visible: boolean): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('qa')) return;
  document.documentElement.dataset.gitquestDialogue = visible ? 'visible' : 'hidden';
}
