/**
 * Design tokens extracted from Figma "BO_Design_리뉴얼" — MBO_dashboard (node 147:9862).
 * The module deliberately does NOT use styled-components ThemeProvider so it cannot
 * collide with the host app's existing theme.
 */
export const t = {
  color: {
    textStrong: '#1D293D',
    textBody: '#45556C',
    textMuted: '#62748E',
    textFaint: 'rgba(15, 23, 43, 0.5)',
    textDisabled: 'rgba(98, 116, 142, 0.72)',

    blue600: '#155DFC',
    blue500: '#2B7FFF',
    blue400: '#51A2FF',
    blue700: '#1D4ED8',
    yellow: '#FFBA00',
    yellowSoft: '#FFDF20',
    indigo: '#7C86FF',
    purple: '#C27AFF',
    green: '#10B981',
    greenDark: '#047857',
    red: '#E7000B',
    redBright: '#FB2C36',
    redSoft: '#FF6467',
    lime: '#9AE600',
    teal: '#00D5BE',

    border: '#E2E8F0',
    divider: '#F1F5F9',
    track: '#E2E8F0',
    cardBg: '#FFFFFF',
    pageBg: '#F8FAFC',
    tileBg: '#F8FAFC',
    chipBg: '#F1F5F9',
    chipSelectedBg: '#EFF6FF',
    chipSelectedBorder: '#BEDBFF',
  },
  font: {
    family:
      "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
    numeric: "'Geist', 'Pretendard', -apple-system, sans-serif",
  },
  gradient: {
    barBlue: ['#8EC5FF', '#2B7FFF'],
    barYellow: ['#FEE685', '#FFBA00'],
    lineArea: ['#FFF085', '#FFFFFF'],
    gauge: ['#8EC5FF', '#2B7FFF'],
  },
  chartPalette: [
    '#51A2FF',
    '#FFBA00',
    '#7C86FF',
    '#C27AFF',
    '#FF6467',
    '#FFDF20',
    '#9AE600',
    '#00D5BE',
  ],
  radius: {
    card: 32,
    tile: 12,
    tooltip: 10,
    chip: 8,
    badge: 6,
    pill: 9999,
  },
  shadow: {
    tooltip: '0 8px 24px rgba(15, 23, 43, 0.12), 0 2px 6px rgba(15, 23, 43, 0.08)',
    segment: '0 1px 2px rgba(15, 23, 43, 0.08)',
  },
  layout: {
    sideWidth: 424,
    gap: 24,
  },
};

export type Tokens = typeof t;
