import { useState, useCallback } from 'react';
import { mockApplications, ApplicationData } from './mockApplications';

let internalStore: ApplicationData[] = [...mockApplications];

export function useApplicationsStore() {
  const [applications, setApplications] = useState<ApplicationData[]>(internalStore);

  const updateApplication = useCallback(
    (id: string, patch: Partial<ApplicationData>) => {
      internalStore = internalStore.map((app) =>
        app.id === id ? { ...app, ...patch } : app
      );
      setApplications([...internalStore]);
    },
    []
  );

  const resetStore = useCallback(() => {
    internalStore = [...mockApplications];
    setApplications([...internalStore]);
  }, []);

  return { applications, updateApplication, resetStore };
}
