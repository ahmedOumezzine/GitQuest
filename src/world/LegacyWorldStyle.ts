export type LegacyPropKey = 'grass' | 'flower' | 'palm' | 'rock' | 'ruin' | 'shell' | 'shrine';

export interface LegacyWorldStyle {
  id: string;
  backgroundKey: string;
  groundLight: string;
  groundDark: string;
  path: string;
  propKeys: LegacyPropKey[];
  obstacle: 'hedge' | 'stone' | 'dock' | 'cliff' | 'wall';
}

const styles: Record<string, LegacyWorldStyle> = {
  'level-02': { id: 'level-02', backgroundKey: 'level-02-forest', groundLight: '#78a85c', groundDark: '#315849', path: '#c9aa69', propKeys: ['grass', 'flower', 'palm'], obstacle: 'hedge' },
  'level-03': { id: 'level-03', backgroundKey: 'level-03-cave', groundLight: '#675b86', groundDark: '#211d3b', path: '#a384aa', propKeys: ['rock', 'shrine'], obstacle: 'stone' },
  'level-04': { id: 'level-04', backgroundKey: 'level-04-harbor', groundLight: '#c88b58', groundDark: '#245166', path: '#e2ba73', propKeys: ['shell', 'ruin', 'palm'], obstacle: 'dock' },
  'level-05': { id: 'level-05', backgroundKey: 'level-05-mountain', groundLight: '#8f817c', groundDark: '#435067', path: '#c4b9a1', propKeys: ['rock', 'grass', 'ruin'], obstacle: 'cliff' },
  'level-06': { id: 'level-06', backgroundKey: 'level-06-castle', groundLight: '#874f60', groundDark: '#302039', path: '#c07a62', propKeys: ['ruin', 'shrine', 'rock'], obstacle: 'wall' },
};

const fallback: LegacyWorldStyle = {
  id: 'fallback',
  backgroundKey: 'menu-background-v2',
  groundLight: '#6f7d70',
  groundDark: '#26304f',
  path: '#b8a06c',
  propKeys: ['rock', 'grass'],
  obstacle: 'stone',
};

export function getLegacyWorldStyle(levelId: string): LegacyWorldStyle {
  return styles[levelId] ?? fallback;
}
