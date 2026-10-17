import type { GitOperation } from '../models/game';

export interface GitCommit { id: string; message: string; files: string[]; branch: string; }
export interface GitSimulatorState {
  version: number;
  initialized: boolean;
  files: Record<string, string>;
  staged: string[];
  commits: GitCommit[];
  currentBranch: string;
  branches: Record<string, string[]>;
  remoteCommits: string[];
  conflicts: string[];
}

export interface GitCommandResult {
  ok: boolean;
  operation?: GitOperation;
  message: string;
  stateChanged: boolean;
}

export class GitSimulator {
  public initialized = false;
  public files: Record<string, string> = { 'notes.txt': 'Une idée naît sur l’île.' };
  public staged: string[] = [];
  public commits: GitCommit[] = [];
  public currentBranch = 'main';
  public branches: Record<string, string[]> = { main: [] };
  public remoteCommits: string[] = [];
  public conflicts: string[] = [];

  public execute(input: string): GitCommandResult {
    const command = input.trim();
    if (!command) return this.fail('Aucune commande.');
    const [program, subcommand, ...args] = command.split(/\s+/);
    if (program !== 'git') return this.fail('Le terminal attend une commande git.');
    if (subcommand === 'init') return this.init();
    if (!this.initialized) return this.fail('fatal: pas un dépôt Git (utilise git init).');
    switch (subcommand) {
      case 'add': return this.add(args.join(' '));
      case 'commit': return this.commit(command);
      case 'push': return this.push();
      case 'pull': return this.pull();
      case 'branch': return this.branch(args[0]);
      case 'switch':
      case 'checkout': return this.switchBranch(args[0]);
      case 'merge': return this.merge(args[0]);
      case 'status': return this.success('Sur la branche ' + this.currentBranch + '.', undefined, false);
      default: return this.fail('git: commande inconnue « ' + subcommand + ' »');
    }
  }

  public toJSON(): GitSimulatorState {
    return { version: 1, initialized: this.initialized, files: this.files, staged: this.staged, commits: this.commits, currentBranch: this.currentBranch, branches: this.branches, remoteCommits: this.remoteCommits, conflicts: this.conflicts };
  }

  public restore(state?: GitSimulatorState): void {
    if (!state) return;
    this.initialized = state.initialized;
    this.files = state.files;
    this.staged = state.staged;
    this.commits = state.commits;
    this.currentBranch = state.currentBranch;
    this.branches = state.branches;
    this.remoteCommits = state.remoteCommits;
    this.conflicts = state.conflicts;
  }

  private init(): GitCommandResult {
    const changed = !this.initialized;
    this.initialized = true;
    return this.success('Dépôt Git initialisé.', 'init', changed);
  }

  private add(path: string): GitCommandResult {
    const paths = path === '.' ? Object.keys(this.files) : path.split(/\s+/).filter(Boolean);
    for (const file of paths) if (this.files[file] !== undefined && !this.staged.includes(file)) this.staged.push(file);
    return this.staged.length ? this.success('Fichiers indexés : ' + this.staged.join(', ') + '.', 'add', true) : this.fail('Aucun fichier correspondant.', 'add');
  }

  private commit(command: string): GitCommandResult {
    const match = command.match(/-m\s+["'](.+?)["']\s*$/);
    if (!match) return this.fail('Utilise git commit -m "ton message".', 'commit');
    if (!this.staged.length) return this.fail('Rien à valider : index vide.', 'commit');
    const commit: GitCommit = { id: 'c' + (this.commits.length + 1), message: match[1], files: [...this.staged], branch: this.currentBranch };
    this.commits.push(commit);
    this.branches[this.currentBranch].push(commit.id);
    this.staged = [];
    return this.success('[' + this.currentBranch + ' ' + commit.id + '] ' + commit.message, 'commit', true);
  }

  private push(): GitCommandResult {
    this.remoteCommits = [...this.branches[this.currentBranch]];
    return this.success('Branche ' + this.currentBranch + ' envoyée vers origin.', 'push', true);
  }

  private pull(): GitCommandResult {
    for (const id of this.remoteCommits) if (!this.branches[this.currentBranch].includes(id)) this.branches[this.currentBranch].push(id);
    return this.success('Déjà à jour avec origin.', 'pull', true);
  }

  private branch(name?: string): GitCommandResult {
    if (!name) return this.success(Object.keys(this.branches).join('\n'), 'branch', false);
    if (this.branches[name]) return this.fail('fatal: la branche ' + name + ' existe déjà.', 'branch');
    this.branches[name] = [...this.branches[this.currentBranch]];
    return this.success('Branche ' + name + ' créée.', 'branch', true);
  }

  private switchBranch(name?: string): GitCommandResult {
    if (!name || !this.branches[name]) return this.fail('fatal: branche ' + (name ?? '') + ' inconnue.', 'switch');
    this.currentBranch = name;
    return this.success('Bascule sur la branche « ' + name + ' ».', 'switch', true);
  }

  private merge(name?: string): GitCommandResult {
    if (!name || !this.branches[name]) return this.fail('Branche à fusionner inconnue.', 'merge');
    if (name === this.currentBranch) return this.fail('Impossible de fusionner une branche avec elle-même.', 'merge');
    const missing = this.branches[name].filter((id) => !this.branches[this.currentBranch].includes(id));
    this.branches[this.currentBranch].push(...missing);
    return this.success('Fusion de ' + name + ' dans ' + this.currentBranch + ' terminée.', 'merge', true);
  }

  private success(message: string, operation?: string, stateChanged = true): GitCommandResult {
    return { ok: true, operation: operation as GitOperation | undefined, message, stateChanged };
  }

  private fail(message: string, operation?: string): GitCommandResult {
    return { ok: false, operation: operation as GitOperation | undefined, message, stateChanged: false };
  }
}
