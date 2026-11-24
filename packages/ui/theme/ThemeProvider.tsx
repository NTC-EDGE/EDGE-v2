import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ThemeContextValue, ThemeColors } from './types';
import { LIGHT_COLORS, DARK_COLORS } from './tokens';
import { themeStorage } from './themeStorage';
import { injectPasswordRevealStyles } from '../utils/webStyles';

// Initialize global web style fixes
injectPasswordRevealStyles();

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const systemScheme = useColorScheme();
  const [webSystemDark, setWebSystemDark] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setWebSystemDark(event.matches);
    };
    setWebSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

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
      if (webSystemDark !== null) {
        return webSystemDark;
      }
      return systemScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemScheme, webSystemDark]);

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
