import { ThemeColors, ThemeSemanticColors } from './types';

const SEMANTIC_LIGHT: ThemeSemanticColors = {
  success: '#10B981', // Emerald 500
  successBg: '#ECFDF5', // Emerald 50
  successBorder: '#A7F3D0', // Emerald 200
  successText: '#065F46', // Emerald 800
  warning: '#F59E0B', // Amber 500
  warningBg: '#FEF3C7', // Amber 50
  warningBorder: '#FDE68A', // Amber 200
  warningText: '#92400E', // Amber 800
  error: '#EF4444', // Red 500
  errorBg: '#FEF2F2', // Red 50
  errorBorder: '#FCA5A5', // Red 200
  errorText: '#991B1B', // Red 800
  info: '#06B6D4', // Cyan 500
  infoBg: '#ECFEFF', // Cyan 50
  infoBorder: '#A5F3FC', // Cyan 200
  infoText: '#155E75', // Cyan 800
};

const SEMANTIC_DARK: ThemeSemanticColors = {
  success: '#34D399', // Emerald 400
  successBg: '#022C22', // Emerald 950
  successBorder: '#065F46', // Emerald 800
  successText: '#A7F3D0', // Emerald 200
  warning: '#FBBF24', // Amber 400
  warningBg: '#451A03', // Amber 950
  warningBorder: '#78350F', // Amber 800
  warningText: '#FDE68A', // Amber 200
  error: '#F87171', // Red 400
  errorBg: '#450A0A', // Red 950
  errorBorder: '#7F1D1D', // Red 900
  errorText: '#FCA5A5', // Red 200
  info: '#38BDF8', // Sky 400
  infoBg: '#082F49', // Sky 950
  infoBorder: '#075985', // Sky 800
  infoText: '#BAE6FD', // Sky 200
};

export const LIGHT_COLORS: ThemeColors = {
  brand: {
    900: '#031A6E', // Official NTC Executive Navy (app.edge.ntc.gov.ph)
    800: '#0B1953', // Deep Enterprise Blue
    700: '#1E3A8A', // Corporate Royal Blue
    600: '#2563EB', // Branded Accent Blue
    505: '#3B82F6', // Active Highlight Blue
    500: '#60A5FA', // Light Focus Blue
    primary: '#1E40AF',
    secondary: '#2563EB',
    accent: '#3B82F6',
    focus: '#60A5FA',
    dark: '#1E3A8A',
    light: '#EFF6FF',
    indigo: '#4F46E5',
    indigoLight: '#EEF2FF',
    indigoBorder: '#E0E7FF',
    indigoHover: '#6366F1',
    navy: '#031A6E',
    navyDark: '#0B132B',
    navyGradient: '#031A6E',
    royalBlue: '#1D4ED8',
    deepBlue: '#1E40AF',
    brightBlue: '#2B56F0',
    blueLight: '#DBEAFE',
    blueSoft: '#BFDBFE',
    skyLight: '#E0F2FE',
    sky: '#0284C7',
    cyan: '#06B6D4',
    teal: '#0D9488',
    emerald: '#059669',
    purple: '#7C3AED',
    purpleLight: '#F3E8FF',
    purpleDark: '#9333EA',
    pink: '#DB2777',
    rose: '#E11D48',
    roseDark: '#BE185D',
    amber: '#D97706',
    amberLight: '#FEF3C7',
    yellowLight: '#FEF9C3',
    greenBright: '#00E676',
    redDark: '#DC2626',
    redLight: '#FEE2E2',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
  },
  semantic: SEMANTIC_LIGHT,
  status: SEMANTIC_LIGHT,
  bg: '#F8FAFC', // Slate 50 canvas
  cardBg: '#FFFFFF', // Pure white card surface
  text: '#0F172A', // Slate 900 primary text
  textMuted: '#64748B', // Slate 500 secondary text
  subtext: '#64748B', // Alias for textMuted
  border: '#E2E8F0', // Slate 200 border
};

export const DARK_COLORS: ThemeColors = {
  brand: {
    900: '#1E3A8A',
    800: '#2563EB',
    700: '#3B82F6',
    600: '#60A5FA',
    505: '#93C5FD',
    500: '#93C5FD',
    primary: '#60A5FA', // Branded Focus Blue accent on dark surfaces
    secondary: '#3B82F6',
    accent: '#2563EB',
    focus: '#93C5FD',
    dark: '#1E3A8A',
    light: '#1E293B',
    indigo: '#818CF8',
    indigoLight: '#1E1B4B',
    indigoBorder: '#312E81',
    indigoHover: '#A5B4FC',
    navy: '#1E3A8A',
    navyDark: '#0B132B',
    navyGradient: '#0E1B61',
    royalBlue: '#3B82F6',
    deepBlue: '#2563EB',
    brightBlue: '#60A5FA',
    blueLight: '#1E293B',
    blueSoft: '#334155',
    skyLight: '#0C4A6E',
    sky: '#38BDF8',
    cyan: '#22D3EE',
    teal: '#2DD4BF',
    emerald: '#34D399',
    purple: '#A78BFA',
    purpleLight: '#3B0764',
    purpleDark: '#C084FC',
    pink: '#F472B6',
    rose: '#FB7185',
    roseDark: '#F43F5E',
    amber: '#FBBF24',
    amberLight: '#451A03',
    yellowLight: '#422006',
    greenBright: '#4ADE80',
    redDark: '#F87171',
    redLight: '#450A0A',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',
    slate300: '#CBD5E1',
    slate400: '#94A3B8',
    slate500: '#64748B',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1E293B',
    slate900: '#0F172A',
  },
  semantic: SEMANTIC_DARK,
  status: SEMANTIC_DARK,
  bg: '#0F172A', // Slate 900 dark canvas
  cardBg: '#1E293B', // Slate 800 dark surface background
  text: '#F8FAFC', // Slate 50 primary text
  textMuted: '#94A3B8', // Slate 400 secondary text
  subtext: '#94A3B8', // Alias for textMuted in dark mode
  border: '#334155', // Slate 700 dark border
};

export const COLORS = LIGHT_COLORS;

export const SPACING = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 6,
  input: 6,
  button: 6,
  card: 8,
  dialog: 12,
  circle: 9999,
} as const;

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  panel: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

/**
 * Typography design tokens.
 * Dense professional scale: pageTitle → sectionTitle → body → caption → overline
 */
export const TYPOGRAPHY = {
  fonts: {
    primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
  },
  sizes: {
    // Named semantic scale (preferred)
    pageTitle: 20,       // h1 — page title, 700
    sectionTitle: 13,    // h2 — card/section header, 600
    body: 13,            // Default body text, 400
    label: 11,           // Form labels, column headers, 600
    caption: 11,         // Secondary/muted text, timestamps, 400
    overline: 10,        // Group labels (ALL CAPS), badges, 700

    // Legacy aliases — kept for backward compatibility
    heading: 20,
    section: 13,
    cardTitle: 13,
    smallLabel: 11,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

/** Convenience alias — identical to TYPOGRAPHY.sizes */
export const FONT_SIZES = TYPOGRAPHY.sizes;

