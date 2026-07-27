import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ApplicationData } from '../data/mockApplications';
import { QueueTab } from '../../shell/context/PermissionContext';
import { useApplicationsStore } from '../data/mockApplicationsStore';

interface ApplicationContextType {
  applications: ApplicationData[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeQueueTab: QueueTab;
  setActiveQueueTab: (tab: QueueTab) => void;
  selectedApplication: ApplicationData | null;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  resetStore: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { applications, updateApplication, resetStore } = useApplicationsStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');

  const selectedApplication =
    selectedId !== null
      ? applications.find((app) => app.id === selectedId) ?? null
      : null;

  const handleSetActiveQueueTab = useCallback((tab: QueueTab) => {
    setActiveQueueTab(tab);
    setSelectedId(null);
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        selectedId,
        setSelectedId,
        activeQueueTab,
        setActiveQueueTab: handleSetActiveQueueTab,
        selectedApplication,
        updateApplication,
        resetStore,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications(): ApplicationContextType {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
}
