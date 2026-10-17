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
  { key: 'island-tileset', path: '/assets/tilesets/island-tileset.svg' },
  ...['player', 'midou', 'chest', 'crystal', 'scroll', 'gate', 'key', 'palm', 'rock', 'grass', 'ruin', 'shrine', 'shrine-glow', 'lighthouse', 'wave', 'flower', 'shell', 'player-scarf', 'midou-staff'].map((key) => ({ key, path: `/assets/sprites/${key}.svg` })),
];

export const spriteSheetAssets: SpriteSheetAssetEntry[] = [
  { key: 'beach-tileset', path: '/assets/tilesets/beach-tileset.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'player-sheet', path: '/assets/sprites/player-sheet.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'midou-sheet', path: '/assets/sprites/midou-sheet.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'player-4dir', path: '/assets/sprites/player-4dir.svg', frameWidth: 32, frameHeight: 32 },
  { key: 'midou-4dir', path: '/assets/sprites/midou-4dir.svg', frameWidth: 32, frameHeight: 32 },
];
