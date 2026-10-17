import './styles/main.css';

const root = document.querySelector<HTMLElement>('#game-root');

void import('./bootstrap').catch((error: unknown) => {
  if (!root) return;
  root.textContent = 'GitQuest ne peut pas démarrer pour le moment.';
  root.setAttribute('data-startup-error', error instanceof Error ? error.message : String(error));
});
