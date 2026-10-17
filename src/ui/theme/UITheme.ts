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
  },
  fontFamily: 'monospace',
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  minTouchTarget: 44,
  borderWidth: 3,
  panelBorderWidth: 4,
  button: { width: 270, height: 54, compactWidth: 250, compactHeight: 48 },
  panel: { maxWidth: 620, margin: 20, compactMargin: 12 },
} as const;

export type UIControlState = 'normal' | 'hover' | 'pressed' | 'disabled' | 'focus' | 'selected';
