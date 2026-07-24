import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/expo';
import {
  useApplications as useApplicationsApi,
  submitApplication as submitApplicationApi,
  SubmitApplicationCommand,
  ApplicationDto,
  ApiResponse,
  PaginatedApiResponse,
} from '@edge/api';
import {
  ApplicationData,
  ApplicationStatus,
  QueueTab,
  RequirementDocument,
  ApplicationCategory,
  ApplicantType,
} from '../data/mockApplications';
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

function mapDtoToApplicationData(dto: ApplicationDto): ApplicationData {
  const firstApplicant =
    dto.applicants !== undefined && dto.applicants.length > 0
      ? dto.applicants[0]
      : null;

  const firstService =
    dto.services !== undefined && dto.services.length > 0
      ? dto.services[0]
      : null;

  const applicantName =
    firstApplicant !== null
      ? `${firstApplicant.firstName} ${firstApplicant.lastName}`.trim()
      : 'Unknown Applicant';

  const refNumber = dto.referenceNumber ?? dto.applicationNumber ?? dto.id.slice(0, 8);
  const permitNum = dto.applicationNumber ?? refNumber;

  const validStatuses: Record<string, ApplicationStatus> = {
    'For Approval': 'For Approval',
    'For Verification': 'For Verification',
    'Returned': 'Returned',
    'Completed': 'Completed',
    'In Process': 'In Process',
    'Declined': 'Declined',
    'Approved': 'Approved',
  };

  const status: ApplicationStatus =
    validStatuses[dto.status] !== undefined
      ? validStatuses[dto.status]
      : 'For Approval';

  const queueTab: QueueTab =
    status === 'Approved' || status === 'Declined' || status === 'Completed'
      ? 'history'
      : status === 'Draft'
      ? 'activity'
      : 'pending';

  const applicantType: ApplicantType =
    firstApplicant?.accountType === 'Company' ? 'Company' : 'Individual';

  const category: ApplicationCategory = 'Permits';

  const requirements: RequirementDocument[] = (dto.requirements ?? []).map((req) => ({
    label: req.requirementId,
    filename: req.url !== '' && req.url.length > 0 ? (req.url.split('/').pop() ?? 'document.pdf') : 'document.pdf',
    thumbnailUri: req.url,
  }));

  return {
    id: dto.id,
    referenceNumber: refNumber,
    permitNumber: permitNum,
    applicant: applicantName,
    applicantType,
    permitTitle: firstService?.applicationTypeKey ?? 'Application Request',
    category,
    status,
    queueTab,
    createdAt: dto.createdAt,
    dateLabel: dto.createdAt !== '' ? new Date(dto.createdAt).toLocaleDateString() : '',
    assignedTo: dto.office ?? 'UNASSIGNED',
    applicationType: dto.submissionMode === 'Bulk' ? 'MULTIPLE' : 'SINGLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: '',
      province: '',
      city: '',
      zipCode: '',
    },
    contactDetails: {
      contactNumber: firstApplicant?.phoneNumber ?? '',
      email: firstApplicant?.email ?? '',
    },
    basicInfo: {
      lastName: firstApplicant?.lastName ?? '',
      firstName: firstApplicant?.firstName ?? '',
      middleName: firstApplicant?.middleName ?? '',
      extensionName: '',
      dob: '',
      placeOfBirth: '',
      sex: '',
      weight: 0,
      height: 0,
      nationality: '',
      employmentStatus: '',
      occupation: '',
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: firstService?.applicationTypeKey ?? 'General',
      formType: 'Standard',
      submittedAt: dto.createdAt,
    },
    requirements,
    forms: [],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: '',
    payment: {
      amountReceived: 0,
      method: 'cash',
      orNumber: '',
      checkNumber: '',
      checkName: '',
    },
    correctionAuditTrail: [],
    history: [],
    note: dto.remarks ?? '',
  };
}

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { applications: mockApplications, updateApplication, resetStore } = useApplicationsStore();
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

  const applications = useMemo(() => {
    if (
      apiApplicationsData?.data !== undefined &&
      apiApplicationsData.data !== null &&
      Array.isArray(apiApplicationsData.data) &&
      apiApplicationsData.data.length > 0
    ) {
      return apiApplicationsData.data.map(mapDtoToApplicationData);
    }
    return mockApplications;
  }, [apiApplicationsData, mockApplications]);

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
