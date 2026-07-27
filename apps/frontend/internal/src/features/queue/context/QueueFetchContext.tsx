import React, { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/expo";
import {
  useApplications as useApplicationsApi,
  useDraftApplications,
} from "@edge/api";
import { useApplications } from "./ApplicationContext";
import { ApplicationData, QueueTab, ApplicationStatus, RequirementDocument, ApplicantType, ApplicationCategory } from "../data/mockApplications";
import { ApplicationDto } from "@edge/api";

import { submitApplication as submitApplicationApi, SubmitApplicationCommand, ApiResponse } from "@edge/api";

interface TabSlice {
  data: ApplicationData[];
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<unknown>;
}

interface QueueFetchContextType {
  all: TabSlice;
  pending: TabSlice;
  history: TabSlice;
  activeTabData: ApplicationData[];
  applications: ApplicationData[];
  selectedApplication: ApplicationData | null;
  isLoading: boolean;
  error: unknown;
  submitApplicationToApi: (command: SubmitApplicationCommand) => Promise<ApiResponse<string>>;
}

const QueueFetchContext = createContext<QueueFetchContextType | undefined>(undefined);

export function mapDtoToApplicationData(dto: ApplicationDto): ApplicationData {
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
      : "Unknown Applicant";

  const refNumber =
    dto.referenceNumber ?? dto.applicationNumber ?? dto.id.slice(0, 8);
  const permitNum = dto.applicationNumber ?? refNumber;

  const validStatuses: Record<string, ApplicationStatus> = {
    "For Approval": "For Approval",
    "For Verification": "For Verification",
    Returned: "Returned",
    Completed: "Completed",
    "In Process": "In Process",
    Declined: "Declined",
    Approved: "Approved",
    Draft: "Draft",
  };

  const status: ApplicationStatus =
    validStatuses[dto.status] !== undefined
      ? validStatuses[dto.status]
      : "For Approval";

  const queueTab: QueueTab =
    status === "Approved" || status === "Declined" || status === "Completed"
      ? "history"
      : status === "Draft"
        ? "activity"
        : "pending";

  const applicantType: ApplicantType =
    firstApplicant?.accountType === "Company" ? "Company" : "Individual";

  const category: ApplicationCategory = "Permits";

  const requirements: RequirementDocument[] = (dto.requirements ?? []).map(
    (req) => ({
      label: req.requirementId,
      filename:
        req.url !== "" && req.url.length > 0
          ? (req.url.split("/").pop() ?? "document.pdf")
          : "document.pdf",
      thumbnailUri: req.url,
    }),
  );

  return {
    id: dto.id,
    referenceNumber: refNumber,
    permitNumber: permitNum,
    applicant: applicantName,
    applicantType,
    permitTitle: firstService?.applicationTypeKey ?? "Application Request",
    category,
    status,
    queueTab,
    createdAt: dto.createdAt,
    dateLabel:
      dto.createdAt !== "" ? new Date(dto.createdAt).toLocaleDateString() : "",
    assignedTo: dto.office ?? "UNASSIGNED",
    applicationType: dto.submissionMode === "Bulk" ? "MULTIPLE" : "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "",
      province: "",
      city: "",
      zipCode: "",
    },
    contactDetails: {
      contactNumber: firstApplicant?.phoneNumber ?? "",
      email: firstApplicant?.email ?? "",
    },
    basicInfo: {
      lastName: firstApplicant?.lastName ?? "",
      firstName: firstApplicant?.firstName ?? "",
      middleName: firstApplicant?.middleName ?? "",
      extensionName: "",
      dob: "",
      placeOfBirth: "",
      sex: "",
      weight: 0,
      height: 0,
      nationality: "",
      employmentStatus: "",
      occupation: "",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: firstService?.applicationTypeKey ?? "General",
      formType: "Standard",
      submittedAt: dto.createdAt,
    },
    requirements,
    forms: [],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: "",
    payment: {
      amountReceived: 0,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [],
    note: dto.remarks ?? "",
  };
}

export function QueueFetchProvider({ children }: { children: ReactNode }) {
  const { activeQueueTab, selectedId } = useApplications();
  const { getToken } = useAuth();
  const clerkGetToken = useCallback(() => getToken(), [getToken]);

  const isAllActive = activeQueueTab === "activity";
  const isPendingActive = activeQueueTab === "pending";
  const isHistoryActive = activeQueueTab === "history";

  // SWR Hooks
  const allResult = useApplicationsApi(
    clerkGetToken,
    isAllActive ? {} : null
  );

  const pendingResult = useDraftApplications(
    clerkGetToken,
    isPendingActive
  );

  const historyResult = useApplicationsApi(
    clerkGetToken,
    isHistoryActive ? { status: "Approved,Declined,Completed" } : null
  );

  // Map Results
  const allData = useMemo(() => {
    return allResult.data?.data?.map(mapDtoToApplicationData) ?? [];
  }, [allResult.data]);

  const pendingData = useMemo(() => {
    return pendingResult.data?.data?.map(mapDtoToApplicationData) ?? [];
  }, [pendingResult.data]);

  const historyData = useMemo(() => {
    return historyResult.data?.data?.map(mapDtoToApplicationData) ?? [];
  }, [historyResult.data]);

  const activeTabData = useMemo(() => {
    if (isAllActive) return allData;
    if (isPendingActive) return pendingData;
    return historyData;
  }, [isAllActive, isPendingActive, allData, pendingData, historyData]);

  const activeIsLoading = isAllActive ? allResult.isLoading : isPendingActive ? pendingResult.isLoading : historyResult.isLoading;
  const activeError = isAllActive ? allResult.error : isPendingActive ? pendingResult.error : historyResult.error;

  const selectedApplication = useMemo(() => {
    return selectedId !== null
      ? (activeTabData.find((app) => app.id === selectedId) ?? null)
      : null;
  }, [activeTabData, selectedId]);

  const submitApplicationToApi = useCallback(
    async (command: SubmitApplicationCommand): Promise<ApiResponse<string>> => {
      const response = await submitApplicationApi(command);
      // mutate all tabs so they refresh when user switches
      await Promise.all([
        allResult.mutate(),
        pendingResult.mutate(),
        historyResult.mutate()
      ]);
      return response;
    },
    [allResult, pendingResult, historyResult],
  );

  return (
    <QueueFetchContext.Provider
      value={{
        all: {
          data: allData,
          isLoading: allResult.isLoading,
          error: allResult.error,
          mutate: allResult.mutate,
        },
        pending: {
          data: pendingData,
          isLoading: pendingResult.isLoading,
          error: pendingResult.error,
          mutate: pendingResult.mutate,
        },
        history: {
          data: historyData,
          isLoading: historyResult.isLoading,
          error: historyResult.error,
          mutate: historyResult.mutate,
        },
        activeTabData,
        applications: activeTabData,
        selectedApplication,
        isLoading: activeIsLoading,
        error: activeError,
        submitApplicationToApi,
      }}
    >
      {children}
    </QueueFetchContext.Provider>
  );
}

export function useQueueFetch(): QueueFetchContextType {
  const context = useContext(QueueFetchContext);
  if (context === undefined) {
    throw new Error("useQueueFetch must be used within a QueueFetchProvider");
  }
  return context;
}
