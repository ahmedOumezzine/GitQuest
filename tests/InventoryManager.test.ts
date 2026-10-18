import test from 'node:test';
import assert from 'node:assert/strict';
import { InventoryManager } from '../src/managers/InventoryManager';

test('l’inventaire gère les quantités et conserve la compatibilité des anciennes sauvegardes', () => {
  const inventory = new InventoryManager();
  assert.equal(inventory.add('memory-shard', 3), true);
  assert.equal(inventory.add('memory-shard', 2), false);
  assert.equal(inventory.quantity('memory-shard'), 5);
  assert.equal(inventory.remove('memory-shard', 2), true);
  assert.equal(inventory.quantity('memory-shard'), 3);

  const restored = new InventoryManager();
  restored.restore({ items: ['pass-key'] });
  assert.equal(restored.has('pass-key'), true);
  assert.equal(restored.quantity('pass-key'), 1);
});

test('l’inventaire persiste un équipement par emplacement', () => {
  const inventory = new InventoryManager();
  inventory.add('archive-compass');
  assert.equal(inventory.equip('archive-compass', 'trinket'), true);
  assert.equal(inventory.isEquipped('archive-compass'), true);

  const restored = new InventoryManager();
  restored.restore(inventory.toJSON());
  assert.equal(restored.isEquipped('archive-compass'), true);
  assert.equal(restored.unequip('trinket'), true);
});
