import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import { ThemeContextValue } from './types';
import { LIGHT_COLORS } from './tokens';

const DEFAULT_THEME_CONTEXT: ThemeContextValue = {
  mode: 'light',
  setMode: () => {},
  colors: LIGHT_COLORS,
  isDark: false,
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null || context === undefined) {
    return DEFAULT_THEME_CONTEXT;
  }
  return context;
}
