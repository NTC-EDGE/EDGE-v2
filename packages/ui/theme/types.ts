export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeBrandColors {
  900: string;
  800: string;
  700: string;
  600: string;
  505: string;
  500: string;
  primary: string;
  secondary: string;
  accent: string;
  focus: string;
  dark: string;
  light: string;
  indigo: string;
  indigoLight: string;
  indigoBorder: string;
  indigoHover: string;
  navy: string;
  navyDark: string;
  navyGradient: string;
  royalBlue: string;
  deepBlue: string;
  brightBlue: string;
  blueLight: string;
  blueSoft: string;
  skyLight: string;
  sky: string;
  cyan: string;
  teal: string;
  emerald: string;
  purple: string;
  purpleLight: string;
  purpleDark: string;
  pink: string;
  rose: string;
  roseDark: string;
  amber: string;
  amberLight: string;
  yellowLight: string;
  greenBright: string;
  redDark: string;
  redLight: string;
  [key: string]: string;
}

export interface ThemeNeutralColors {
  white: string;
  black: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  slate50: string;
  slate100: string;
  slate200: string;
  slate300: string;
  slate400: string;
  slate500: string;
  slate600: string;
  slate700: string;
  slate800: string;
  slate900: string;
}

export interface ThemeSemanticGroup {
  main: string;
  bg: string;
  border: string;
  text: string;
}

export interface ThemeSemanticColors {
  success: string;
  successBg: string;
  successBorder: string;
  successText: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  warningText: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  info: string;
  infoBg: string;
  infoBorder: string;
  infoText: string;
}

export interface ThemeColors {
  brand: ThemeBrandColors;
  neutral: ThemeNeutralColors;
  semantic: ThemeSemanticColors;
  status: ThemeSemanticColors;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  subtext: string;
  border: string;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

