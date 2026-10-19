import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCoverZoom, calculateGameplayHudLayout, calculateLayout, calculateMenuCenterY, calculateTouchLayout, TOUCH_LAYOUT_SIZES } from '../src/ui/layout/ResponsiveLayoutManager';

test('le layout identifie correctement les modes desktop, compact et portrait', () => {
  const desktop = calculateLayout(1920, 1080);
  assert.equal(desktop.compact, false);
  assert.equal(desktop.portrait, false);
  assert.equal(desktop.topBarHeight, 64);

  const phoneLandscape = calculateLayout(844, 390);
  assert.equal(phoneLandscape.compact, true);
  assert.equal(phoneLandscape.portrait, false);
  assert.equal(phoneLandscape.topBarHeight, 88);

  const phonePortrait = calculateLayout(390, 844);
  assert.equal(phonePortrait.compact, true);
  assert.equal(phonePortrait.portrait, true);
  assert.equal(phonePortrait.topBarHeight, 118);
});

test('les marges et zones sûres restent dans le viewport', () => {
  const metrics = calculateLayout(390, 844);
  assert.equal(metrics.safe.left, 12);
  assert.equal(metrics.safe.right, 12);
  assert.ok(metrics.topBarHeight < metrics.height);
});

test('le menu compacte ses actions en bas en paysage étroit', () => {
  const metrics = calculateLayout(844, 390);
  const centerY = calculateMenuCenterY(metrics, 164);
  assert.equal(centerY, 296);
  assert.equal(centerY + 82, metrics.height - metrics.margin);
});

test('les contrôles tactiles restent dans les zones sûres en portrait et paysage', () => {
  const portrait = calculateTouchLayout(calculateLayout(390, 844));
  assert.ok(portrait.joystick.y + TOUCH_LAYOUT_SIZES.joystickHitRadius <= 844 - 12);
  for (const metrics of [calculateLayout(390, 844), calculateLayout(844, 390)]) {
    const touch = calculateTouchLayout(metrics);
    assert.ok(touch.joystick.x - TOUCH_LAYOUT_SIZES.joystickHitRadius >= metrics.margin);
    assert.ok(touch.joystick.y + TOUCH_LAYOUT_SIZES.joystickHitRadius <= metrics.height - metrics.margin);
    assert.ok(touch.action.x + TOUCH_LAYOUT_SIZES.actionHitRadius <= metrics.width - metrics.margin);
    assert.ok(touch.action.y + TOUCH_LAYOUT_SIZES.actionLabelBottom <= metrics.height - metrics.margin);
    assert.ok(touch.terminal.y - TOUCH_LAYOUT_SIZES.actionHitRadius >= metrics.margin);
  }
});

test('les boutons tactiles gardent une zone de pression confortable', () => {
  assert.ok(TOUCH_LAYOUT_SIZES.actionHitRadius >= 36);
  assert.ok(TOUCH_LAYOUT_SIZES.actionLabelBottom >= TOUCH_LAYOUT_SIZES.actionRadius);
});

test('le HUD portrait empile l’objectif et les statistiques sans chevauchement', () => {
  const metrics = calculateLayout(390, 844);
  const hud = calculateGameplayHudLayout(metrics, 220, 144, 150);
  assert.equal(hud.quest.x, 12);
  assert.equal(hud.quest.width, 366);
  assert.equal(hud.xp.y, 72, 'les statistiques restent dans la seconde ligne compacte');
  assert.equal(hud.xp.y, hud.inventory.y);
  assert.ok(hud.xp.x + 144 <= hud.inventory.x);
  assert.ok(hud.inventory.x + 150 <= metrics.width - metrics.margin);
});

test('le HUD paysage mobile sépare la mission de la colonne XP/inventaire', () => {
  const metrics = calculateLayout(844, 390);
  const hud = calculateGameplayHudLayout(metrics, 220, 144, 150);
  assert.equal(hud.quest.x, 12);
  assert.equal(hud.xp.x, 682);
  assert.equal(hud.inventory.x, 682);
  assert.ok(hud.quest.x + hud.quest.width + 12 <= hud.xp.x);
  assert.equal(hud.xp.y, 8);
  assert.equal(hud.inventory.y, 48);
});

test('le HUD desktop reste proche des bords utiles sans réserver une bande opaque', () => {
  const metrics = calculateLayout(1280, 720);
  const hud = calculateGameplayHudLayout(metrics, 360, 144, 170);
  assert.equal(hud.quest.y, 12);
  assert.equal(hud.xp.y, 12);
  assert.equal(hud.inventory.y, 54);
});

test('le zoom de caméra couvre les grands écrans sans zone vide', () => {
  assert.equal(calculateCoverZoom({ width: 1280, height: 720 }, { width: 960, height: 544 }), 1.3333333333333333);
  assert.equal(calculateCoverZoom({ width: 1908, height: 900 }, { width: 960, height: 544 }), 1.9875);
  assert.equal(calculateCoverZoom({ width: 390, height: 844 }, { width: 960, height: 544 }), 1.5514705882352942);
});
