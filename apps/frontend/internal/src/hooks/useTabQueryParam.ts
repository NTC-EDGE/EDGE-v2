import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

function isWindowAvailable(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getSafeSessionItem(key: string): string | null {
  if (!isWindowAvailable()) return null;
  try {
    if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
      return window.sessionStorage.getItem(key);
    }
  } catch {
    // Restricted in strict privacy / cross-origin iframe / SSR modes
  }
  return null;
}

function setSafeSessionItem(key: string, value: string): void {
  if (!isWindowAvailable()) return;
  try {
    if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

/**
 * Custom Hook: Synchronizes active tab state with Web URL query parameters (?tab=...)
 * and sessionStorage, persisting the selected tab across browser refreshes and reloads.
 */
export function useTabQueryParam<T extends string>(
  paramKey: string,
  defaultTab: T,
  validTabs: readonly T[]
): [T, (tab: T) => void] {
  const getInitialTab = (): T => {
    if (Platform.OS === 'web' && isWindowAvailable()) {
      try {
        if (window.location !== undefined && typeof window.location.search === 'string') {
          const urlParams = new URLSearchParams(window.location.search);
          const queryVal = urlParams.get(paramKey);
          if (queryVal !== null && queryVal !== '') {
            const match = validTabs.find(
              (t) => t.toLowerCase() === queryVal.toLowerCase()
            );
            if (match !== undefined) {
              return match;
            }
          }
        }
        const stored = getSafeSessionItem(`tab_${paramKey}`);
        if (stored !== null && stored !== '') {
          const match = validTabs.find(
            (t) => t.toLowerCase() === stored.toLowerCase()
          );
          if (match !== undefined) {
            return match;
          }
        }
      } catch {
        // ignore
      }
    }
    return defaultTab;
  };

  const [tab, setTabState] = useState<T>(getInitialTab);

  const setTab = useCallback(
    (newTab: T) => {
      setTabState(newTab);
      if (Platform.OS === 'web' && isWindowAvailable()) {
        try {
          if (window.location !== undefined && typeof window.location.href === 'string') {
            const url = new URL(window.location.href);
            url.searchParams.set(paramKey, newTab.toLowerCase());
            window.history.replaceState(null, '', url.toString());
          }
          setSafeSessionItem(`tab_${paramKey}`, newTab);
        } catch {
          // ignore
        }
      }
    },
    [paramKey]
  );

  return [tab, setTab];
}
