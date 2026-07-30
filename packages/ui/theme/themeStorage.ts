import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from './types';

const THEME_STORAGE_KEY = '@edge/ui/theme_mode';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export const themeStorage = {
  async getMode(): Promise<ThemeMode | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (isThemeMode(raw)) {
            return raw;
          }
        }
        return null;
      } else {
        const raw = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isThemeMode(raw)) {
          return raw;
        }
        return null;
      }
    } catch {
      return null;
    }
  },

  async setMode(mode: ThemeMode): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch {
      // Catch storage error gracefully
    }
  },
};
