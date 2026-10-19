export interface AssetEntry {
  key: string;
  path: string;
}

export interface SpriteSheetAssetEntry extends AssetEntry {
  frameWidth: number;
  frameHeight: number;
}

export const imageAssets: AssetEntry[] = [
  ...['menu-background', 'menu-logo', 'menu-subtitle', 'menu-button-gold', 'menu-button-navy', 'menu-panel'].map((key) => ({ key, path: `/assets/ui/${key}.svg` })),
  { key: 'menu-background-v2', path: '/assets/ui/menu-background-v2.png' },
  { key: 'menu-foreground-v3', path: '/assets/ui/menu-foreground-v3.png' },
  { key: 'menu-chest-v3', path: '/assets/ui/menu-chest-v3.png' },
  ...[
    ['level-02-forest', 'level-02-forest.png'],
    ['level-03-cave', 'level-03-cave.png'],
    ['level-04-harbor', 'level-04-harbor.png'],
    ['level-05-mountain', 'level-05-mountain.png'],
    ['level-06-castle', 'level-06-castle.png'],
  ].map(([key, file]) => ({ key, path: `/assets/backgrounds/${file}` })),
  { key: 'island-tileset', path: '/assets/tilesets/island-tileset.svg' },
  // Tilemaps need the complete atlas image; loading this as a spritesheet
  // would expose only Phaser frames and can misalign Tiled tile ids.
  { key: 'beach-tileset', path: '/assets/tilesets/beach-tileset-v3.png' },
  { key: 'forest-tileset', path: '/assets/tilesets/forest-tileset-v1.png' },
  { key: 'cave-tileset', path: '/assets/tilesets/cave-tileset-v1.png' },
  { key: 'harbor-tileset', path: '/assets/tilesets/harbor-tileset-v1.png' },
  { key: 'mountain-tileset', path: '/assets/tilesets/mountain-tileset-v1.png' },
  { key: 'castle-tileset', path: '/assets/tilesets/castle-tileset-v1.png' },
  ...[
    ['forest-ancient-tree', 'ancient-tree'],
    ['forest-root-cluster', 'root-cluster'],
    ['forest-fern-cluster', 'fern-cluster'],
    ['forest-flower-bush', 'flower-bush'],
    ['forest-mushroom-patch', 'mushroom-patch'],
    ['forest-mossy-rock', 'mossy-rock'],
    ['forest-ruin-fragment', 'ruin-fragment'],
    ['forest-archive-crate', 'archive-crate'],
    ['forest-staging-shrine', 'staging-shrine'],
    ['forest-gate-closed', 'gate-closed'],
    ['forest-gate-open', 'gate-open'],
    ['forest-canopy-shadow', 'canopy-shadow'],
  ].map(([key, file]) => ({ key, path: `/assets/sprites/forest/${file}.png` })),
  ...[
    ['cave-stalactite', 'cave-stalactite'],
    ['cave-stalagmite', 'cave-stalagmite'],
    ['cave-crystal-pink', 'cave-crystal-pink'],
    ['cave-crystal-cyan', 'cave-crystal-cyan'],
    ['cave-torch', 'cave-torch'],
    ['cave-memory-tablet', 'cave-memory-tablet'],
    ['cave-commit-altar', 'cave-commit-altar'],
    ['cave-archive-chest', 'cave-archive-chest'],
    ['cave-gate-closed', 'cave-gate-closed'],
    ['cave-gate-open', 'cave-gate-open'],
    ['cave-puddle', 'cave-puddle'],
    ['cave-rocks', 'cave-rocks'],
    ['cave-vines', 'cave-vines'],
    ['cave-dust', 'cave-dust'],
    ['cave-rune', 'cave-rune'],
    ['cave-lantern', 'cave-lantern'],
  ].map(([key, file]) => ({ key, path: `/assets/sprites/cave/${file}.png` })),
  ...[
    ['harbor-dock-post', 'harbor-dock-post'],
    ['harbor-lantern', 'harbor-lantern'],
    ['harbor-boat', 'harbor-boat'],
    ['harbor-crate', 'harbor-crate'],
    ['harbor-barrel', 'harbor-barrel'],
    ['harbor-rope', 'harbor-rope'],
    ['harbor-buoy', 'harbor-buoy'],
    ['harbor-local-pylon', 'harbor-local-pylon'],
    ['harbor-remote-pylon', 'harbor-remote-pylon'],
    ['harbor-connection-altar', 'harbor-connection-altar'],
    ['harbor-gate-closed', 'harbor-gate-closed'],
    ['harbor-gate-open', 'harbor-gate-open'],
    ['harbor-wave-foam', 'harbor-wave-foam'],
    ['harbor-rocks', 'harbor-rocks'],
    ['harbor-shells', 'harbor-shells'],
    ['harbor-lighthouse', 'harbor-lighthouse'],
  ].map(([key, file]) => ({ key, path: `/assets/sprites/harbor/${file}.png` })),
  ...[
    ['mountain-pine', 'mountain-pine'],
    ['mountain-cairn', 'mountain-cairn'],
    ['mountain-cliff-rock', 'mountain-cliff-rock'],
    ['mountain-snow-pine', 'mountain-snow-pine'],
    ['mountain-bridge', 'mountain-bridge'],
    ['mountain-fork-sign', 'mountain-fork-sign'],
    ['mountain-branch-altar', 'mountain-branch-altar'],
    ['mountain-archive-chest', 'mountain-archive-chest'],
    ['mountain-gate-closed', 'mountain-gate-closed'],
    ['mountain-gate-open', 'mountain-gate-open'],
    ['mountain-branch-marker', 'mountain-branch-marker'],
    ['mountain-crystal', 'mountain-crystal'],
    ['mountain-rope-rail', 'mountain-rope-rail'],
    ['mountain-snow-patch', 'mountain-snow-patch'],
    ['mountain-wildflowers', 'mountain-wildflowers'],
    ['mountain-wind-flag', 'mountain-wind-flag'],
  ].map(([key, file]) => ({ key, path: `/assets/sprites/mountain/${file}.png` })),
  ...[
    ['castle-crystal', 'castle-crystal'],
    ['castle-archive-chest', 'castle-archive-chest'],
    ['castle-merge-altar', 'castle-merge-altar'],
    ['castle-gate-closed', 'castle-gate-closed'],
    ['castle-gate-open', 'castle-gate-open'],
    ['castle-banner', 'castle-banner'],
    ['castle-brazier', 'castle-brazier'],
    ['castle-rune-tablet', 'castle-rune-tablet'],
    ['castle-arch', 'castle-arch'],
    ['castle-gargoyle', 'castle-gargoyle'],
    ['castle-thorn-vine', 'castle-thorn-vine'],
    ['castle-cart', 'castle-cart'],
    ['castle-signpost', 'castle-signpost'],
    ['castle-rail', 'castle-rail'],
    ['castle-merge-sigil', 'castle-merge-sigil'],
    ['castle-rubble', 'castle-rubble'],
  ].map(([key, file]) => ({ key, path: `/assets/sprites/castle/${file}.png` })),
  { key: 'player-menu-v2', path: '/assets/sprites/player-menu-v2.png' },
  { key: 'midou-menu-v2', path: '/assets/sprites/midou-menu-v2.png' },
  { key: 'midou-portrait-v3', path: '/assets/sprites/midou-portrait-v3.png' },
  { key: 'menu-duo-v3', path: '/assets/sprites/menu-duo-v3.png' },
  { key: 'level-01-palm-v1', path: '/assets/sprites/level-01-palm-v1.png' },
  { key: 'level-01-rock-garden-v1', path: '/assets/sprites/level-01-rock-garden-v1.png' },
  { key: 'level-01-ruin-garden-v1', path: '/assets/sprites/level-01-ruin-garden-v1.png' },
  { key: 'level-01-shrine-v1', path: '/assets/sprites/level-01-shrine-v1.png' },
  { key: 'level-01-gate-v1', path: '/assets/sprites/level-01-gate-v1.png' },
  { key: 'level-01-player-v1', path: '/assets/sprites/level-01-player-v1.png' },
  { key: 'level-01-midou-v1', path: '/assets/sprites/level-01-midou-v1.png' },
  { key: 'level-01-grass-cluster-v1', path: '/assets/sprites/level-01-grass-cluster-v1.png' },
  { key: 'level-01-chest-closed-v1', path: '/assets/sprites/level-01-chest-closed-v1.png' },
  { key: 'level-01-chest-open-v1', path: '/assets/sprites/level-01-chest-open-v1.png' },
  { key: 'level-01-memory-crystal-v1', path: '/assets/sprites/level-01-memory-crystal-v1.png' },
  { key: 'professor-octo-v1', path: '/assets/sprites/professor-octo-v1.png' },
  { key: 'professor-octo-portrait-v1', path: '/assets/portraits/professor-octo-portrait-v1.png' },
  ...['player', 'midou', 'chest', 'crystal', 'scroll', 'gate', 'key', 'palm', 'rock', 'grass', 'ruin', 'shrine', 'shrine-glow', 'lighthouse', 'wave', 'flower', 'shell', 'player-scarf', 'midou-staff'].map((key) => ({ key, path: `/assets/sprites/${key}.svg` })),
];

export const spriteSheetAssets: SpriteSheetAssetEntry[] = [
  { key: 'player-sheet', path: '/assets/sprites/player-sheet.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'midou-sheet', path: '/assets/sprites/midou-sheet.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'player-4dir', path: '/assets/sprites/player-4dir.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'midou-4dir', path: '/assets/sprites/midou-4dir.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'level-01-player-sheet-v1', path: '/assets/sprites/level-01-player-sheet-v1.png', frameWidth: 96, frameHeight: 96 },
  { key: 'level-01-midou-sheet-v1', path: '/assets/sprites/level-01-midou-sheet-v1.png', frameWidth: 96, frameHeight: 96 },
];

const menuAssetKeys = new Set([
  'menu-background',
  'menu-logo',
  'menu-subtitle',
  'menu-button-gold',
  'menu-button-navy',
  'menu-panel',
  'menu-background-v2',
  'menu-foreground-v3',
  'menu-chest-v3',
  'menu-duo-v3',
  'midou-menu-v2',
  'midou-portrait-v3',
  'wave',
]);

const level01AssetKeys = new Set([
  'beach-tileset',
  'level-01-palm-v1',
  'level-01-rock-garden-v1',
  'level-01-ruin-garden-v1',
  'level-01-shrine-v1',
  'level-01-gate-v1',
  'level-01-player-v1',
  'level-01-grass-cluster-v1',
  'level-01-chest-closed-v1',
  'level-01-chest-open-v1',
  'level-01-memory-crystal-v1',
  'professor-octo-v1',
  'professor-octo-portrait-v1',
  'flower',
  'shell',
  'shrine-glow',
  'chest',
  'crystal',
  'scroll',
  // Existing local coastal props reused for the level-one premium composition.
  'harbor-boat',
  'harbor-dock-post',
  'harbor-wave-foam',
  'harbor-rocks',
  'harbor-shells',
]);

const persistentItemIconKeys = new Set(['key', 'crystal', 'scroll', 'shrine-glow', 'chest']);
const professorOctoAssetKeys = new Set(['professor-octo-v1', 'professor-octo-portrait-v1']);

const levelAssetPrefixes: Record<string, string> = {
  'level-02': 'forest-',
  'level-03': 'cave-',
  'level-04': 'harbor-',
  'level-05': 'mountain-',
  'level-06': 'castle-',
};

const levelBackgroundKeys: Record<string, string> = {
  'level-02': 'level-02-forest',
  'level-03': 'level-03-cave',
  'level-04': 'level-04-harbor',
  'level-05': 'level-05-mountain',
  'level-06': 'level-06-castle',
};

/** Assets needed to render the title screen. Heavy regional assets are lazy-loaded. */
export const menuImageAssets = imageAssets.filter((asset) => menuAssetKeys.has(asset.key));

/** Assets needed for the 96px player and Midou used by all enhanced regions. */
export const enhancedCharacterSpriteSheets = spriteSheetAssets.filter((asset) => asset.key.startsWith('level-01-'));
const genericCharacterSpriteSheets = spriteSheetAssets.filter((asset) => asset.key === 'player-sheet' || asset.key === 'midou-sheet');

/** Return only the raster assets required by one playable level. */
export function assetsForLevel(levelId: string): { images: AssetEntry[]; spriteSheets: SpriteSheetAssetEntry[] } {
  const prefix = levelAssetPrefixes[levelId];
  const images = imageAssets.filter((asset) => {
    if (levelId === 'level-01') return level01AssetKeys.has(asset.key);
    return persistentItemIconKeys.has(asset.key)
      || ((levelId === 'level-02' || levelId === 'level-03' || levelId === 'level-04') && professorOctoAssetKeys.has(asset.key))
      || asset.key === levelBackgroundKeys[levelId]
      || Boolean(prefix && asset.key.startsWith(prefix));
  });
  return { images, spriteSheets: [...genericCharacterSpriteSheets, ...enhancedCharacterSpriteSheets] };
}
// Asset paths stay readable and testable as public-root paths; PreloadScene
// resolves them through Vite's BASE_URL before handing them to Phaser.
