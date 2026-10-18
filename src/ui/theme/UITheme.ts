export const UITheme = {
  colors: {
    ink: 0x10172b,
    panel: 0x10172b,
    panelRaised: 0x18233e,
    button: 0x273e68,
    buttonHover: 0x354d7d,
    buttonPressed: 0xdcae38,
    buttonSelected: 0xf7c84b,
    border: 0x10172b,
    borderAccent: 0xf7d56a,
    text: '#fff6df',
    textMuted: '#cbd5e1',
    accent: '#f7d56a',
    success: '#9ef0c1',
    danger: '#ff9b9b',
    goldSoft: 0xffe7a84a,
    panelLine: 0x38527f,
    panelShadow: 0x080d1b,
  },
  // Keep a deterministic pixel-friendly fallback stack. A bundled font is
  // intentionally not required for the first release, so the UI remains
  // usable offline and on GitHub Pages.
  fontFamily: 'Courier New, monospace',
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  minTouchTarget: 44,
  borderWidth: 3,
  panelBorderWidth: 4,
  button: { width: 270, height: 54, compactWidth: 250, compactHeight: 48 },
  menuButton: { width: 356, height: 64, compactWidth: 292, compactHeight: 52 },
  panel: { maxWidth: 620, margin: 20, compactMargin: 12 },
} as const;

export type UIControlState = 'normal' | 'hover' | 'pressed' | 'disabled' | 'focus' | 'selected';
