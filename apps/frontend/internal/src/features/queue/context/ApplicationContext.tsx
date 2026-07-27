import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  ApplicationData,
  QueueTab,
} from "../data/mockApplications";
import { useApplicationsStore } from "../data/mockApplicationsStore";

export interface ApplicationContextType {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeQueueTab: QueueTab;
  setActiveQueueTab: (tab: QueueTab) => void;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  resetStore: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined,
);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const {
    updateApplication,
    resetStore,
  } = useApplicationsStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>("activity");

  const handleSetActiveQueueTab = useCallback((tab: QueueTab) => {
    setActiveQueueTab(tab);
    setSelectedId(null);
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        selectedId,
        setSelectedId,
        activeQueueTab,
        setActiveQueueTab: handleSetActiveQueueTab,
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
    throw new Error(
      "useApplications must be used within an ApplicationProvider",
    );
  }
  return context;
}
