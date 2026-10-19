import test from 'node:test';
import assert from 'node:assert/strict';
import { GitSimulator } from '../src/systems/GitSimulator';

test('GitSimulator respecte les espaces et le vrai état du dépôt', () => {
  const git = new GitSimulator();
  assert.equal(git.execute('git init').ok, true);
  assert.equal(git.execute('git add .').ok, true);
  const commit = git.execute('git commit -m "premier souvenir de l’île"');
  assert.equal(commit.ok, true);
  assert.equal(git.commits[0].message, 'premier souvenir de l’île');
  assert.deepEqual(git.staged, []);
});

test('GitSimulator gère les branches, switch et merge', () => {
  const git = new GitSimulator();
  git.execute('git init');
  git.execute('git add .');
  git.execute('git commit -m "base"');
  assert.equal(git.execute('git branch feature').ok, true);
  assert.equal(git.execute('git switch feature').ok, true);
  git.execute('git add .');
  git.execute('git commit -m "travail"');
  git.execute('git switch main');
  assert.equal(git.execute('git merge feature').ok, true);
  assert.ok(git.branches.main.includes('c2'));
});

test('une commande Git sans init échoue', () => {
  assert.equal(new GitSimulator().execute('git add .').ok, false);
});

test('push et pull dépendent réellement de l’historique local et distant', () => {
  const git = new GitSimulator();
  git.execute('git init');
  assert.equal(git.execute('git push').ok, false);
  git.execute('git add .');
  git.execute('git commit -m "port"');
  const push = git.execute('git push origin main');
  assert.equal(push.ok, true);
  assert.deepEqual(git.remoteCommits, ['c1']);
  const pull = git.execute('git pull origin main');
  assert.equal(pull.ok, true);
  assert.equal(pull.operation, 'pull');
  const fresh = new GitSimulator();
  fresh.execute('git init');
  assert.equal(fresh.execute('git pull origin main').ok, false);
});
