import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

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
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
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
        if (typeof window.sessionStorage !== 'undefined') {
          const stored = window.sessionStorage.getItem(`tab_${paramKey}`);
          if (stored !== null && stored !== '') {
            const match = validTabs.find(
              (t) => t.toLowerCase() === stored.toLowerCase()
            );
            if (match !== undefined) {
              return match;
            }
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
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set(paramKey, newTab.toLowerCase());
          window.history.replaceState(null, '', url.toString());
          if (typeof window.sessionStorage !== 'undefined') {
            window.sessionStorage.setItem(`tab_${paramKey}`, newTab);
          }
        } catch {
          // ignore
        }
      }
    },
    [paramKey]
  );

  return [tab, setTab];
}
