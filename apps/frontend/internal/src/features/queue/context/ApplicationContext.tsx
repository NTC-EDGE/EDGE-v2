import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@clerk/expo';
import {
  useApplications as useApplicationsApi,
  submitApplication as submitApplicationApi,
  SubmitApplicationCommand,
  ApplicationDto,
  ApiResponse,
  PaginatedApiResponse,
} from '@edge/api';
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
  isLoadingApi: boolean;
  apiError: unknown;
  apiApplicationsData: PaginatedApiResponse<ApplicationDto> | undefined;
  submitApplicationToApi: (
    command: SubmitApplicationCommand
  ) => Promise<ApiResponse<string>>;
  mutateApiApplications: () => Promise<PaginatedApiResponse<ApplicationDto> | undefined>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined
);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { applications, updateApplication, resetStore } = useApplicationsStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');

  const { getToken } = useAuth();
  const clerkGetToken = useCallback(
    () => getToken(),
    [getToken]
  );

  const {
    data: apiApplicationsData,
    error: apiError,
    isLoading: isLoadingApi,
    mutate: mutateApiApplications,
  } = useApplicationsApi(clerkGetToken);

  const submitApplicationToApi = useCallback(
    async (command: SubmitApplicationCommand): Promise<ApiResponse<string>> => {
      const response = await submitApplicationApi(command);
      await mutateApiApplications();
      return response;
    },
    [mutateApiApplications]
  );

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
        isLoadingApi,
        apiError,
        apiApplicationsData,
        submitApplicationToApi,
        mutateApiApplications,
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
      'useApplications must be used within an ApplicationProvider'
    );
  }
  return context;
}
