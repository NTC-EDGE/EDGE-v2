import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { QueueTab } from '../../shell/context/PermissionContext';
import { ApplicationData } from '../../../types/application';
import { useAdminApplications, applicationService } from '@edge/api';
import { mapApplicationDtoToUI } from '../data/applicationMapper';

interface ApplicationContextType {
  applications: ApplicationData[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeQueueTab: QueueTab;
  setActiveQueueTab: (tab: QueueTab) => void;
  selectedApplication: ApplicationData | null;
  isDetailsLoading: boolean;
  fetchApplicationDetails: (id: string) => Promise<ApplicationData | null>;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => Promise<void>;
  togglePinApplication: (id: string) => Promise<void>;
  toggleArchiveApplication: (id: string) => Promise<void>;
  evaluateApplication: (id: string) => Promise<void>;
  resetStore: () => void;
  isLoading: boolean;
  isError: boolean;
  toast: { message: string; variant: 'success' | 'error' } | null;
  showToast: (message: string, variant?: 'success' | 'error') => void;
  dismissToast: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeQueueTab, setActiveQueueTab] = useState<QueueTab>('activity');
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, ApplicationData>>({});
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);

  const showToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ message, variant });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const { applications: rawDtos, isLoading, isError, refetch } = useAdminApplications({
    queueTab: activeQueueTab,
    scope: 'queue',
  });

  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<ApplicationData>>>({});

  const applications = useMemo(() => {
    return rawDtos.map((dto) => {
      const app = mapApplicationDtoToUI(dto);
      const override = localOverrides[dto.id];
      return override ? { ...app, ...override } : app;
    });
  }, [rawDtos, localOverrides]);

  const fetchApplicationDetails = useCallback(async (id: string): Promise<ApplicationData | null> => {
    setIsDetailsLoading(true);
    const [fullDto, err] = await applicationService.getApplicationById(id);
    setIsDetailsLoading(false);
    if (err !== null || !fullDto) {
      if (err) showToast(err, 'error');
      return null;
    }
    const fullApp = mapApplicationDtoToUI(fullDto);
    setDetailsCache((prev) => ({ ...prev, [id]: fullApp }));
    return fullApp;
  }, [showToast]);

  const handleSelectId = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id && !detailsCache[id]) {
      fetchApplicationDetails(id);
    }
  }, [detailsCache, fetchApplicationDetails]);

  const selectedApplication = useMemo(() => {
    if (selectedId === null) return null;
    const baseSummary = applications.find((app) => app.id === selectedId) ?? null;
    const cachedDetail = detailsCache[selectedId];
    const override = localOverrides[selectedId];

    const merged = cachedDetail
      ? { ...cachedDetail, ...(baseSummary ?? {}) }
      : baseSummary;

    return merged && override ? { ...merged, ...override } : merged;
  }, [selectedId, applications, detailsCache, localOverrides]);

  const handleSetActiveQueueTab = useCallback((tab: QueueTab) => {
    setActiveQueueTab(tab);
    setSelectedId(null);
  }, []);

  const updateApplication = useCallback(async (id: string, patch: Partial<ApplicationData>) => {
    setLocalOverrides((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), ...patch },
    }));

    if (patch.status) {
      const [res, err] = await applicationService.updateStatus(id, {
        status: patch.status,
        remarks: patch.note,
      });
      if (err !== null) {
        setToast({ message: err, variant: 'error' });
        return;
      }
      setToast({ message: 'Application status updated successfully.', variant: 'success' });
      refetch();
    } else {
      const [res, err] = await applicationService.adminUpdateApplication(id, patch as Record<string, unknown>);
      if (err !== null) {
        setToast({ message: err, variant: 'error' });
        return;
      }
      setToast({ message: 'Application details updated successfully.', variant: 'success' });
    }
  }, [refetch]);

  const togglePinApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    const newPinned = !app?.isPinned;
    const [res, err] = await applicationService.togglePin(id, newPinned);
    if (err !== null) {
      setToast({ message: err, variant: 'error' });
      return;
    }
    setToast({ message: `Application ${newPinned ? 'pinned' : 'unpinned'} successfully.`, variant: 'success' });
    refetch();
  }, [applications, refetch]);

  const toggleArchiveApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    const newArchived = !app?.isArchived;
    const [res, err] = await applicationService.toggleArchive(id, newArchived);
    if (err !== null) {
      setToast({ message: err, variant: 'error' });
      return;
    }
    setToast({ message: `Application ${newArchived ? 'archived' : 'unarchived'} successfully.`, variant: 'success' });
    if (selectedId === id) setSelectedId(null);
    refetch();
  }, [applications, selectedId, refetch]);

  const evaluateApplication = useCallback(async (id: string) => {
    setSelectedId(id);
    const app = applications.find((a) => a.id === id);
    if (app && app.status === 'Submitted') {
      const [res, err] = await applicationService.evaluate(id, 'Started evaluation process from queue action menu.');
      if (err !== null) {
        setToast({ message: err, variant: 'error' });
        return;
      }
      setToast({ message: 'Evaluation process started successfully.', variant: 'success' });
      refetch();
    }
  }, [applications, refetch]);

  const resetStore = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        selectedId,
        setSelectedId: handleSelectId,
        activeQueueTab,
        setActiveQueueTab: handleSetActiveQueueTab,
        selectedApplication,
        isDetailsLoading,
        fetchApplicationDetails,
        updateApplication,
        togglePinApplication,
        toggleArchiveApplication,
        evaluateApplication,
        resetStore,
        isLoading,
        isError,
        toast,
        showToast,
        dismissToast,
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
