import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { LevelDefinition } from '../src/models/game';

test('les six chapitres déclarent un résumé et des découvertes optionnelles', async () => {
  for (let order = 1; order <= 6; order += 1) {
    const level = JSON.parse(await readFile(`public/data/levels/level-0${order}.json`, 'utf8')) as LevelDefinition;
    assert.ok(level.journal?.summary.fr, level.id);
    const secrets = level.objects.filter((object) => object.optional && object.secret);
    assert.ok(secrets.length >= 2, `${level.id} doit proposer au moins deux découvertes`);
    assert.ok(secrets.some((object) => object.kind === 'crystal'));
    assert.ok(secrets.some((object) => object.kind === 'scroll'));
    assert.ok(secrets.every((object) => object.itemId), `${level.id} doit donner un objet aux découvertes`);
    const shortcut = secrets.find((object) => object.kind === 'shortcut');
    assert.ok(shortcut?.destination, `${level.id} doit proposer un passage alternatif`);
  }
});
