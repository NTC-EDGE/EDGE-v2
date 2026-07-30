import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ThemeContextValue, ThemeColors } from './types';
import { LIGHT_COLORS, DARK_COLORS } from './tokens';
import { themeStorage } from './themeStorage';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const systemScheme = useColorScheme();

  useEffect(() => {
    let isMounted = true;
    async function loadPersistedMode() {
      const savedMode = await themeStorage.getMode();
      if (isMounted && savedMode !== null) {
        setModeState(savedMode);
      }
    }
    loadPersistedMode();
    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    themeStorage.setMode(newMode);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo<ThemeColors>(() => {
    return isDark ? DARK_COLORS : LIGHT_COLORS;
  }, [isDark]);

  const contextValue = useMemo<ThemeContextValue>(() => ({
    mode,
    setMode,
    colors,
    isDark,
  }), [mode, setMode, colors, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
