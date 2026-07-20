export const COLORS = {
  brand: {
    900: '#0A1B66', // Navigation background
    800: '#1236A8', // Primary buttons
    700: '#2F56E8', // Hover
    600: '#4D73FF', // Active
    500: '#7392FF', // Selected
    100: '#E6EDFF', // Light theme accent
  },
  neutral: {
    white: '#FFFFFF',
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
  },
  semantic: {
    success: '#16A34A',
    successBg: '#DCFCE7',
    successBorder: '#BBF7D0',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    warningBorder: '#FDE68A',
    error: '#DC2626',
    errorBg: '#FEE2E2',
    errorBorder: '#FECACA',
    info: '#0284C7',
    infoBg: '#E0F2FE',
    infoBorder: '#BAE6FD',
  },
  bg: '#F6F8FC',
  glass: {
    bg: 'rgba(255, 255, 255, 0.82)',
    border: 'rgba(255, 255, 255, 0.55)',
  },
} as const;

export const SPACING = {
  4: 4,
  8: 8,
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
  input: 10,
  button: 12,
  card: 16,
  dialog: 20,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
} as const;

export const TYPOGRAPHY = {
  fonts: {
    primary: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  sizes: {
    heading: 36,
    section: 24,
    cardTitle: 18,
    body: 16,
    smallLabel: 14,
    caption: 12,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
