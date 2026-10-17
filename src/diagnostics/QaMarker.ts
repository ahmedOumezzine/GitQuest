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
