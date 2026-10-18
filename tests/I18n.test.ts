import test from 'node:test';
import assert from 'node:assert/strict';
import { I18nManager } from '../src/managers/I18nManager';

test('le menu expose les textes principaux dans les trois langues', () => {
  const i18n = new I18nManager('fr');
  assert.equal(i18n.text('newGame'), 'Nouvelle partie');
  i18n.locale = 'en';
  assert.equal(i18n.text('newGame'), 'New game');
  i18n.locale = 'ar';
  assert.equal(i18n.direction, 'rtl');
  assert.ok(i18n.text('settings').length > 0);
});

test('les réglages audio indiquent honnêtement leur indisponibilité', () => {
  const i18n = new I18nManager('fr');
  assert.match(i18n.text('audioUnavailable'), /audio/i);
});

test('le parcours Nouvelle partie est traduit dans les trois langues', () => {
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const i18n = new I18nManager(locale);
    assert.ok(i18n.text('newGameConfirmMessage').length > 0);
    assert.ok(i18n.text('introLine1').length > 0);
    assert.ok(i18n.text('introLine4').length > 0);
    assert.ok(i18n.text('introNext').length > 0);
    assert.ok(i18n.text('introPage').length > 0);
    assert.ok(i18n.text('skip').length > 0);
  }
  assert.equal(new I18nManager('ar').direction, 'rtl');
});

test('les écrans de démarrage et de victoire sont traduits dans les trois langues', () => {
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const i18n = new I18nManager(locale);
    for (const key of ['bootLoading', 'bootLoadError', 'assetMissing', 'victoryTitle', 'victoryMessage', 'totalXp', 'replay']) {
      assert.ok(i18n.text(key).length > 0, `${locale}.${key} doit être traduit`);
    }
  }
});

test('les indications du guide et de la porte sont traduites', () => {
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const i18n = new I18nManager(locale);
    assert.ok(i18n.text('midouName').length > 0, `${locale}.midouName`);
    assert.ok(i18n.text('gateName').length > 0, `${locale}.gateName`);
    assert.ok(i18n.text('gateLockedHint').length > 0, `${locale}.gateLockedHint`);
    assert.ok(i18n.text('terminalAction').length > 0, `${locale}.terminalAction`);
  }
});

test('les messages visibles du terminal suivent la langue active', () => {
  assert.equal(new I18nManager('en').gitMessage('Dépôt Git initialisé.'), 'Git repository initialized.');
  assert.equal(new I18nManager('ar').gitMessage('Dépôt Git initialisé.'), 'تم تهيئة مستودع Git.');
  assert.equal(new I18nManager('en').gitMessage('Branche feature créée.'), 'Branch feature created.');
});

test('l’aide du terminal indique la prochaine commande dans chaque langue', () => {
  assert.equal(new I18nManager('fr').commandHint('init'), 'Étape suivante : exécute git init.');
  assert.equal(new I18nManager('en').commandHint('commit'), 'Next step: run git commit -m "message".');
  assert.equal(new I18nManager('ar').commandHint('merge'), 'الخطوة التالية: نفّذ git merge main.');
  assert.match(new I18nManager('fr').commandHint(), /git init/);
});

test('les étapes Git et les interactions HUD sont localisées dans les trois langues', () => {
  const stepIds = ['talk-midou', 'run-init', 'run-add', 'run-commit', 'run-push', 'run-pull', 'run-branch', 'run-switch', 'run-merge', 'collect-key', 'open-exit'];
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const i18n = new I18nManager(locale);
    for (const stepId of stepIds) assert.ok(i18n.stepLabel(stepId).length > 0, `${locale}.${stepId}`);
    assert.match(i18n.interactionHint('mentor'), /E/);
    assert.ok(i18n.interactionHint('gate').length > 0);
  }
});

test('les objectifs proposent une action guidée selon leur type', () => {
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const i18n = new I18nManager(locale);
    assert.notEqual(i18n.objectiveGuidance({ id: 'talk', kind: 'dialogue', dialogueId: 'midou' }), i18n.objectiveGuidance({ id: 'git', kind: 'git-command', operation: 'init' }));
    assert.ok(i18n.objectiveGuidance({ id: 'talk', kind: 'dialogue', dialogueId: 'midou' }).length > 0, `${locale}.dialogue guidance`);
    assert.ok(i18n.objectiveGuidance({ id: 'git', kind: 'git-command', operation: 'init' }).length > 0, `${locale}.git guidance`);
    assert.ok(i18n.objectiveGuidance({ id: 'key', kind: 'collect', objectId: 'chest' }).length > 0, `${locale}.collect guidance`);
    assert.ok(i18n.objectiveGuidance({ id: 'exit', kind: 'open-exit' }).length > 0, `${locale}.exit guidance`);
  }
  assert.match(new I18nManager('fr').objectiveGuidance(), /Mission terminée/);
});
