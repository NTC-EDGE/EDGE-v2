import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { useUser, useAuth } from "@clerk/expo";
import { apiClient } from "@edge/api";
import { useApi } from "../../../../shared/hooks/useApi";
import { extractApiErrorMessage } from "../../../../shared/components/Toast";
import { NTCService } from "../../data/servicesData";
import {
  RadioOperatorCertData,
  DeviceRegistrationData,
  TVRORegistrationData,
  VASProviderData,
  CopyOfCertificateData,
  initialRadioOperatorCertData,
  initialDeviceRegistrationData,
  initialTVRORegistrationData,
  initialVASProviderData,
  initialCopyOfCertificateData,
  serializeCertificateApplicant,
} from "../../certificates";
import {
  AmateurRadioStationLicenseData,
  LifetimeAmateurLicenseData,
  initialAmateurRadioStationLicenseData,
  initialLifetimeAmateurLicenseData,
} from "../../licenses";
import {
  AmateurPermitData,
  initialAmateurPermitData,
  CopyOfPermitData,
  initialCopyOfPermitData,
} from "../../permits";
import { isValidContactNumber, isValidEmailAddress } from "../../../../shared/helpers/fieldValidators";
import { extractUserProfile } from "../../../../shared/utils/userProfileHelper";
import { uploadRequirementsAfterSubmit } from "../helpers/requirementUploadHelper";
import { isScheduleOpenForFiling } from "../components/ExamScheduleCard";
import { useServiceForm } from "./useServiceForm";

const isGuid = (val?: string | null): boolean => {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

export interface TenantInfo {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface OfficeInfo {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface ExamScheduleItem {
  id: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  maximumSlots?: number;
  availableSlots?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  startApplication?: string;
  endApplication?: string;
  applicationDeadline?: string;
  regionName?: string;
  tenantName?: string;
  serviceName?: string;
  remarks?: string;
  title?: string;
  [key: string]: unknown;
}

export interface GeneralApplicantData {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  applicantType?: "individual" | "company";
  companyName?: string;
  representativeFirstName?: string;
  representativeMiddleName?: string;
  representativeLastName?: string;
  representativeSuffix?: string;
  representativeName?: string;
  representativePosition?: string;
  dtiSecRegistration?: string;
  email: string;
  contactNo: string;
  sex?: string;
  civilStatus?: string;
  nationality?: string;
  zipCode?: string;
  address: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  street?: string;
  schoolName?: string;
  schoolAttended?: string;
  courseDegree?: string;
  courseTaken?: string;
  yearGraduated?: string;
  specialOrderNo?: string;
  examType?: string;
  examineeType?: string;
  selectedOption?: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  birthDate?: string;
  notes: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  selectedElementId?: string;
  selectedElementTitle?: string;
  uploads: Record<string, { name: string; uri: string; type?: string; file?: File | Blob } | string>;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  signatureUrl?: string;
  // Specialized Certificate, License & Permit Models
  radioCertData?: RadioOperatorCertData;
  deviceRegData?: DeviceRegistrationData;
  tvroRegData?: TVRORegistrationData;
  vasData?: VASProviderData;
  copyOfCertData?: CopyOfCertificateData;
  copyOfPermitData?: CopyOfPermitData;
  amateurLicenseData?: AmateurRadioStationLicenseData;
  lifetimeLicenseData?: LifetimeAmateurLicenseData;
  permitData?: AmateurPermitData;
}

export const initialGeneralApplicant = (id: number): GeneralApplicantData => ({
  id,
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  applicantType: "individual",
  companyName: "",
  representativeFirstName: "",
  representativeMiddleName: "",
  representativeLastName: "",
  representativeSuffix: "",
  representativeName: "",
  representativePosition: "",
  dtiSecRegistration: "",
  email: "",
  contactNo: "",
  address: "",
  birthMonth: "January",
  birthDay: "1",
  birthYear: "2000",
  notes: "",
  selectedVariantId: "",
  uploads: {},
  radioCertData: initialRadioOperatorCertData(id),
  deviceRegData: initialDeviceRegistrationData(id),
  tvroRegData: initialTVRORegistrationData(id),
  vasData: initialVASProviderData(id),
  copyOfCertData: initialCopyOfCertificateData(id),
  copyOfPermitData: initialCopyOfPermitData(id),
  amateurLicenseData: initialAmateurRadioStationLicenseData(id),
  lifetimeLicenseData: initialLifetimeAmateurLicenseData(id),
  permitData: initialAmateurPermitData(id),
});

export interface ServiceVariantInfo {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  code?: string;
  [key: string]: unknown;
}

export interface ServiceVariantElementInfo {
  id: string;
  code?: string;
  description?: string;
  name?: string;
  [key: string]: unknown;
}

export interface ServiceRequirementItem {
  id?: string;
  key?: string;
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  hint?: string;
  isRequired?: boolean;
  required?: boolean;
  [key: string]: unknown;
}

export function isRequirementMandatory(req: ServiceRequirementItem | string): boolean {
  if (typeof req === "string") {
    const lower = req.toLowerCase().trim();
    if (
      lower.includes("(optional)") ||
      lower.includes("[optional]") ||
      lower.endsWith("optional") ||
      lower.startsWith("optional")
    ) {
      return false;
    }
    return true;
  }
  if (typeof req === "object" && req !== null) {
    if (req.isRequired !== undefined) return Boolean(req.isRequired);
    if (req.required !== undefined) return Boolean(req.required);
    const label = (req.name || req.label || req.title || req.description || "").toLowerCase().trim();
    if (
      label.includes("(optional)") ||
      label.includes("[optional]") ||
      label.endsWith("optional") ||
      label.startsWith("optional")
    ) {
      return false;
    }
  }
  return true;
}

export function isRequirementUploaded(
  req: ServiceRequirementItem | string,
  idx: number,
  uploads: Record<string, { name?: string; uri?: string } | string | undefined> | undefined
): boolean {
  if (!uploads) return false;
  const isReqObj = typeof req === "object" && req !== null;
  const reqId = isReqObj && req.id ? String(req.id).trim() : "";
  const reqLabel = (isReqObj ? (req.name || req.label || req.title || "") : req).trim();

  const candidateKeys = [
    reqId ? `req-${reqId}` : "",
    reqId,
    `req-${idx}`,
    `req-gen-${idx}`,
    idx.toString(),
    reqLabel,
    reqLabel.replace(/\*$/, "").trim(),
  ].filter(Boolean);

  for (const k of candidateKeys) {
    const val = uploads[k];
    if (val !== undefined && val !== null) {
      if (typeof val === "string" && val.trim().length > 0) return true;
      if (typeof val === "object" && Boolean(val.name || val.uri)) return true;
    }
  }

  // Also check if any key in uploads matches case-insensitively or by prefix/substring
  const uploadEntries = Object.entries(uploads);
  for (const [upKey, upVal] of uploadEntries) {
    if (!upVal) continue;
    const isValidVal =
      (typeof upVal === "string" && upVal.trim().length > 0) ||
      (typeof upVal === "object" && Boolean(upVal.name || upVal.uri));
    if (!isValidVal) continue;

    const upKeyLower = upKey.toLowerCase().trim();
    if (
      (reqId && upKeyLower.includes(reqId.toLowerCase())) ||
      (reqLabel && upKeyLower === reqLabel.toLowerCase()) ||
      (reqLabel && upKeyLower === reqLabel.replace(/\*$/, "").toLowerCase().trim()) ||
      upKeyLower === `req-${idx}` ||
      upKeyLower === `req-gen-${idx}`
    ) {
      return true;
    }
  }

  return false;
}

export const isGeneralApplicantComplete = (
  app: GeneralApplicantData,
  service?: NTCService,
  variantRequirements: Array<ServiceRequirementItem | string> = []
): boolean => {
  // 1. Basic details (must have valid name, email, contact number)
  const hasName =
    (Boolean(app.firstName && app.firstName.trim().length > 0) && Boolean(app.lastName && app.lastName.trim().length > 0)) ||
    Boolean(app.companyName && app.companyName.trim().length > 0) ||
    Boolean(app.representativeName && app.representativeName.trim().length > 0) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          ((fv.fieldId &&
            (fv.fieldId.toLowerCase().includes("name") ||
              fv.fieldId.toLowerCase().includes("fullname") ||
              fv.fieldId.toLowerCase().includes("company") ||
              fv.fieldId.toLowerCase().includes("applicant"))) ||
            (fv.fieldLabel &&
              (fv.fieldLabel.toLowerCase().includes("name") ||
                fv.fieldLabel.toLowerCase().includes("applicant") ||
                fv.fieldLabel.toLowerCase().includes("company")))) &&
          fv.value &&
          fv.value.trim().length > 0
      )
    );

  const hasEmail =
    Boolean(app.email && isValidEmailAddress(app.email)) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          (fv.fieldId?.toLowerCase().includes("email") || fv.fieldLabel?.toLowerCase().includes("email")) &&
          fv.value &&
          isValidEmailAddress(fv.value.trim())
      )
    );

  const hasContact =
    Boolean(app.contactNo && isValidContactNumber(app.contactNo)) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          (fv.fieldId?.toLowerCase().includes("contact") ||
            fv.fieldLabel?.toLowerCase().includes("contact") ||
            fv.fieldId?.toLowerCase().includes("phone") ||
            fv.fieldLabel?.toLowerCase().includes("phone") ||
            fv.fieldId?.toLowerCase().includes("mobile") ||
            fv.fieldLabel?.toLowerCase().includes("mobile")) &&
          fv.value &&
          fv.value.trim().length > 0
      )
    );

  if (!hasName || !hasEmail || !hasContact) {
    return false;
  }

  // 2. Document upload validation: only mandatory requirements must be uploaded
  const reqList =
    variantRequirements && variantRequirements.length > 0
      ? variantRequirements
      : service?.requirements && service.requirements.length > 0
      ? service.requirements
      : [];

  if (reqList.length > 0) {
    const mandatoryList = reqList
      .map((req, idx) => ({ req, idx }))
      .filter(({ req }) => isRequirementMandatory(req));

    const allMandatoryUploaded = mandatoryList.every(({ req, idx }) =>
      isRequirementUploaded(req, idx, app.uploads)
    );

    if (!allMandatoryUploaded) {
      return false;
    }
  }

  return true;
};

export interface UseGeneralServiceWizardOptions {
  service: NTCService;
  selectedRegionId?: string | null;
  setSelectedRegionId?: (id: string) => void;
  selectedOfficeId?: string | null;
  setSelectedOfficeId?: (id: string) => void;
  selectedScheduleId?: string | null;
  setSelectedScheduleId?: (id: string | null) => void;
  appMode?: "SINGLE" | "BULK" | "";
  applicants?: GeneralApplicantData[];
  setApplicants?: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex?: number;
  step?: number;
}

export function useGeneralServiceWizard(
  optionsOrService: UseGeneralServiceWizardOptions | NTCService,
  stepArg: number = 1
) {
  const api = useApi();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();

  const isOptionsObject = typeof optionsOrService === "object" && "service" in optionsOrService;
  const service = isOptionsObject ? (optionsOrService as UseGeneralServiceWizardOptions).service : (optionsOrService as NTCService);
  const currentStep = isOptionsObject ? ((optionsOrService as UseGeneralServiceWizardOptions).step || 1) : stepArg;
  const appMode = isOptionsObject ? (optionsOrService as UseGeneralServiceWizardOptions).appMode : undefined;

  const [localApplicantIndex, setLocalApplicantIndex] = useState(0);
  const [localApplicants, setLocalApplicants] = useState<GeneralApplicantData[]>([
    initialGeneralApplicant(1),
  ]);

  const currentApplicantIndex = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).currentApplicantIndex !== undefined
    ? (optionsOrService as UseGeneralServiceWizardOptions).currentApplicantIndex!
    : localApplicantIndex;

  const applicants = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).applicants !== undefined
    ? (optionsOrService as UseGeneralServiceWizardOptions).applicants!
    : localApplicants;

  const setApplicants = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).setApplicants !== undefined
    ? (optionsOrService as UseGeneralServiceWizardOptions).setApplicants!
    : setLocalApplicants;

  const [localRegionId, setLocalRegionId] = useState<string>("");
  const [localOfficeId, setLocalOfficeId] = useState<string>("");

  const selectedRegionId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).selectedRegionId !== undefined
    ? ((optionsOrService as UseGeneralServiceWizardOptions).selectedRegionId || "")
    : localRegionId;

  const setSelectedRegionId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).setSelectedRegionId !== undefined
    ? (optionsOrService as UseGeneralServiceWizardOptions).setSelectedRegionId!
    : setLocalRegionId;

  const selectedOfficeId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).selectedOfficeId !== undefined
    ? ((optionsOrService as UseGeneralServiceWizardOptions).selectedOfficeId || "")
    : localOfficeId;

  const setSelectedOfficeId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).setSelectedOfficeId !== undefined
    ? (optionsOrService as UseGeneralServiceWizardOptions).setSelectedOfficeId!
    : setLocalOfficeId;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [filingIntent, setFilingIntent] = useState<"Regular" | "AssessmentOnly">("Regular");

  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);

  // Examination Schedule State
  const isExamService = Boolean(
    service?.category?.toLowerCase()?.includes("exam") ||
    service?.categoryCode?.toLowerCase()?.includes("exam") ||
    service?.serviceCategoryCode?.toLowerCase()?.includes("exam") ||
    service?.title?.toLowerCase()?.includes("exam") ||
    service?.title?.toLowerCase()?.includes("admission") ||
    service?.title?.toLowerCase()?.includes("operator examination") ||
    service?.serviceCategory?.type === "Exam" ||
    service?.serviceCategory?.type === 1 ||
    service?.code === "NTC_1_01" ||
    service?.id === "50000000-0000-0000-0000-000000000001"
  );
  const [schedules, setSchedules] = useState<ExamScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [localScheduleId, setLocalScheduleId] = useState<string | null>(null);

  const selectedScheduleId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).selectedScheduleId !== undefined
    ? ((optionsOrService as UseGeneralServiceWizardOptions).selectedScheduleId ?? null)
    : localScheduleId;

  const setSelectedScheduleId = isOptionsObject && (optionsOrService as UseGeneralServiceWizardOptions).setSelectedScheduleId !== undefined
    ? ((optionsOrService as UseGeneralServiceWizardOptions).setSelectedScheduleId ?? setLocalScheduleId)
    : setLocalScheduleId;

  // Fetch Examination Schedules when Region changes for exam services
  React.useEffect(() => {
    let active = true;
    async function fetchSchedules() {
      if (!isExamService || !selectedRegionId || !service?.id) {
        if (active) setSchedules([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        const data = await api
          .get<unknown>(
            `/api/v2/schedules/client-view?serviceId=${service.id}&tenantId=${selectedRegionId}&pageSize=50`
          )
          .catch(async () => {
            return await api
              .get<unknown>(
                `/api/v2/schedules?serviceId=${service.id}&tenantId=${selectedRegionId}&pageSize=50`
              )
              .catch(() => null);
          });

        if (!active) return;
        if (!data) {
          setSchedules([]);
          return;
        }

        const dataObj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
        const rawItems = Array.isArray(data)
          ? data
          : Array.isArray(dataObj.items)
          ? (dataObj.items as unknown[])
          : Array.isArray(dataObj.data)
          ? (dataObj.data as unknown[])
          : [];

        const mappedSchedules: ExamScheduleItem[] = rawItems.map((rawItem: unknown) => {
          const item = typeof rawItem === "object" && rawItem !== null ? (rawItem as Record<string, unknown>) : {};
          const itemDate = typeof item.scheduledDate === "string" ? item.scheduledDate : undefined;
          const itemStart = typeof item.startTime === "string" ? item.startTime : undefined;
          const itemEnd = typeof item.endTime === "string" ? item.endTime : undefined;

          const startD = typeof item.startDate === "string" ? new Date(item.startDate) : new Date();
          const endD = typeof item.endDate === "string" ? new Date(item.endDate) : new Date();
          const scheduledDate = itemDate && itemDate.length > 0
            ? itemDate
            : !isNaN(startD.getTime())
            ? startD.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "TBA";
          const startTime = itemStart && itemStart.length > 0
            ? itemStart
            : !isNaN(startD.getTime())
            ? startD.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "08:00 AM";
          const endTime = itemEnd && itemEnd.length > 0
            ? itemEnd
            : !isNaN(endD.getTime())
            ? endD.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "12:00 PM";

          return {
            id: String(item.id || ""),
            scheduledDate,
            startTime,
            endTime,
            venue: typeof item.venue === "string" ? item.venue : "NTC Regional Examination Center",
            maximumSlots: typeof item.maximumSlots === "number" ? item.maximumSlots : undefined,
            availableSlots: typeof item.availableSlots === "number" ? item.availableSlots : undefined,
            description: typeof item.description === "string" ? item.description : typeof item.remarks === "string" ? item.remarks : undefined,
            startDate: typeof item.startDate === "string" ? item.startDate : undefined,
            endDate: typeof item.endDate === "string" ? item.endDate : undefined,
            startApplication: typeof item.startApplication === "string" ? item.startApplication : undefined,
            endApplication: typeof item.endApplication === "string" ? item.endApplication : typeof item.applicationDeadline === "string" ? item.applicationDeadline : undefined,
            applicationDeadline: typeof item.applicationDeadline === "string" ? item.applicationDeadline : typeof item.endApplication === "string" ? item.endApplication : undefined,
            regionName: typeof item.regionName === "string" ? item.regionName : typeof item.tenantName === "string" ? item.tenantName : undefined,
            tenantName: typeof item.tenantName === "string" ? item.tenantName : typeof item.regionName === "string" ? item.regionName : undefined,
            serviceName: typeof item.serviceName === "string" ? item.serviceName : undefined,
            title: typeof item.title === "string" ? item.title : undefined,
            remarks: typeof item.remarks === "string" ? item.remarks : typeof item.description === "string" ? item.description : undefined,
          };
        });
        setSchedules(mappedSchedules);
        const currentSelectedSched = mappedSchedules.find((s) => s.id === selectedScheduleId);
        if (!currentSelectedSched || !isScheduleOpenForFiling(currentSelectedSched)) {
          const firstOpenSchedule = mappedSchedules.find((s) => isScheduleOpenForFiling(s));
          setSelectedScheduleId(firstOpenSchedule ? firstOpenSchedule.id : null);
        }
      } catch (err) {
        console.warn("[useGeneralServiceWizard] Failed to fetch exam schedules:", err);
        if (active) setSchedules([]);
      } finally {
        if (active) setLoadingSchedules(false);
      }
    }
    fetchSchedules();
    return () => { active = false; };
  }, [isExamService, selectedRegionId, service?.id]);

  const [variants, setVariants] = useState<ServiceVariantInfo[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantElements, setVariantElements] = useState<ServiceVariantElementInfo[]>([]);
  const [loadingElements, setLoadingElements] = useState(false);

  // Fetch variants when service changes so variant names are available across all steps (including Step 5 review)
  React.useEffect(() => {
    let active = true;
    const fetchServiceVariants = async () => {
      if (!service?.id) return;
      try {
        setLoadingVariants(true);
        const varRes = await api.get<unknown>(`/api/v2/services/${service.id}/variants`).catch(() => null);
        if (active) {
          let fetchedVariants: ServiceVariantInfo[] = [];
          const resObj = typeof varRes === "object" && varRes !== null ? (varRes as Record<string, unknown>) : {};
          if (resObj.succeeded && Array.isArray(resObj.data)) {
            fetchedVariants = resObj.data as ServiceVariantInfo[];
          } else if (Array.isArray(varRes)) {
            fetchedVariants = varRes as ServiceVariantInfo[];
          } else if (Array.isArray(resObj.items)) {
            fetchedVariants = resObj.items as ServiceVariantInfo[];
          }
          setVariants(fetchedVariants);

          const buildReadableVariantName = (v: ServiceVariantInfo): string => {
            const desc = (v.description || v.name || "").trim();
            const typeStr =
              v.type &&
              typeof v.type === "string" &&
              v.type.toUpperCase() !== "NA" &&
              v.type.toUpperCase() !== "N/A"
                ? v.type.toUpperCase()
                : "";
            if (desc.length > 0 && typeStr.length > 0) {
              return desc.toUpperCase().includes(`(${typeStr})`) ? desc : `${desc} (${typeStr})`;
            }
            return desc || typeStr || "";
          };

          // Auto-select initial variant if applicant has no variant selected yet, or backfill missing selectedVariantName
          if (fetchedVariants.length > 0) {
            const firstVariant = fetchedVariants[0];
            if (firstVariant) {
              setApplicants((prev) =>
                prev.map((app, idx) => {
                  if (idx === currentApplicantIndex && !app.selectedVariantId) {
                    return {
                      ...app,
                      selectedVariantId: firstVariant.id,
                      selectedVariantName: buildReadableVariantName(firstVariant),
                    };
                  }
                  if (app.selectedVariantId && !app.selectedVariantName) {
                    const matched = fetchedVariants.find(
                      (v) => String(v.id).toLowerCase() === String(app.selectedVariantId).toLowerCase()
                    );
                    if (matched) {
                      return {
                        ...app,
                        selectedVariantName: buildReadableVariantName(matched),
                      };
                    }
                  }
                  return app;
                })
              );
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch service variants:", err);
      } finally {
        if (active) setLoadingVariants(false);
      }
    };
    fetchServiceVariants();
    return () => { active = false; };
  }, [service?.id]);

  const activeApplicant = applicants[currentApplicantIndex] || initialGeneralApplicant(1);
  const effectiveVariantId = activeApplicant.selectedVariantId || (variants[0] ? variants[0].id : null);
  const { form } = useServiceForm(service?.id, effectiveVariantId);

  React.useEffect(() => {
    let active = true;
    const fetchVariantElements = async () => {
      if ((currentStep !== 2 && currentStep !== 3) || !effectiveVariantId || !service?.id) {
        if (active) setVariantElements([]);
        return;
      }
      try {
        setLoadingElements(true);
        const elRes = await api
          .get<unknown>(`/api/v2/service-variant-elements?serviceVariantId=${effectiveVariantId}`)
          .catch(async () => {
            return await api.get<unknown>(`/api/v2/services/${service.id}/variants/${effectiveVariantId}/elements`).catch(() => null);
          });

        if (active) {
          const elObj = typeof elRes === "object" && elRes !== null ? (elRes as Record<string, unknown>) : {};
          if (elObj.succeeded && Array.isArray(elObj.data)) {
            setVariantElements(elObj.data as ServiceVariantElementInfo[]);
          } else if (Array.isArray(elRes)) {
            setVariantElements(elRes as ServiceVariantElementInfo[]);
          } else if (Array.isArray(elObj.items)) {
            setVariantElements(elObj.items as ServiceVariantElementInfo[]);
          } else {
            setVariantElements([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch variant elements:", err);
        if (active) setVariantElements([]);
      } finally {
        if (active) setLoadingElements(false);
      }
    };
    fetchVariantElements();
    return () => { active = false; };
  }, [currentStep, effectiveVariantId, service?.id]);

  // Fetch variant requirements when variant or service changes
  const [variantRequirements, setVariantRequirements] = useState<Array<ServiceRequirementItem | string>>([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchVariantRequirements = async () => {
      if (!service?.id) return;
      if (!effectiveVariantId) {
        if (active) {
          setVariantRequirements(service.requirements || []);
        }
        return;
      }
      try {
        setLoadingRequirements(true);
        const reqRes = await api
          .get<unknown>(`/api/v2/services/${service.id}/requirements?variantId=${effectiveVariantId || ""}`)
          .catch(async () => {
            return await api.get<unknown>(`/api/v2/service-variant-requirements?serviceVariantId=${effectiveVariantId || ""}`).catch(() => null);
          });

        if (active) {
          let list: Array<ServiceRequirementItem | string> = [];
          const resObj = typeof reqRes === "object" && reqRes !== null ? (reqRes as Record<string, unknown>) : {};
          const rawItems =
            resObj.succeeded && Array.isArray(resObj.data)
              ? (resObj.data as unknown[])
              : Array.isArray(reqRes)
              ? (reqRes as unknown[])
              : Array.isArray(resObj.items)
              ? (resObj.items as unknown[])
              : [];

          if (rawItems.length > 0) {
            list = rawItems.map((r: unknown) => {
              if (typeof r === "string") return r;
              const rObj = typeof r === "object" && r !== null ? (r as Record<string, unknown>) : {};
              const idStr = typeof rObj.id === "string" ? rObj.id : typeof rObj.requirementId === "string" ? rObj.requirementId : undefined;
              const nameStr = typeof rObj.name === "string" ? rObj.name : typeof rObj.title === "string" ? rObj.title : typeof rObj.description === "string" ? rObj.description : "Requirement";
              const descStr = typeof rObj.description === "string" ? rObj.description : undefined;
              const isReqBool = typeof rObj.isRequired === "boolean" ? rObj.isRequired : true;

              return {
                id: idStr,
                name: nameStr,
                description: descStr,
                isRequired: isReqBool,
              };
            });
          }

          if (list.length === 0 && service.requirements && Array.isArray(service.requirements) && service.requirements.length > 0) {
            list = service.requirements;
          }
          setVariantRequirements(list.filter(Boolean));
        }
      } catch (err) {
        console.warn("Failed to fetch variant requirements:", err);
      } finally {
        if (active) setLoadingRequirements(false);
      }
    };
    fetchVariantRequirements();
    return () => { active = false; };
  }, [effectiveVariantId, service?.id]);

  // Pre-fill user profile for single application (once on mount/auth)
  const hasPrefilledProfileRef = React.useRef(false);
  React.useEffect(() => {
    let active = true;
    async function loadUserProfileForPrefill() {
      if (!clerkUser || hasPrefilledProfileRef.current) return;

      // 1. Initial prefill from local storage / Clerk metadata
      const initialProfile = extractUserProfile(clerkUser, null);
      setApplicants((prev) =>
        prev.map((app, idx) => {
          if (idx !== 0) return app;
          const isBlank = !app.firstName && !app.lastName && !app.email && !app.contactNo && !app.selectedVariantId;
          const repFirst = app.representativeFirstName || initialProfile.representativeFirstName || initialProfile.firstName || initialProfile.fullName.split(" ")[0] || "";
          const repMiddle = app.representativeMiddleName || initialProfile.representativeMiddleName || initialProfile.middleName || "";
          const repLast = app.representativeLastName || initialProfile.representativeLastName || initialProfile.lastName || initialProfile.fullName.split(" ").slice(1).join(" ") || "";
          const repSuffix = app.representativeSuffix || initialProfile.representativeSuffix || initialProfile.suffix || "";
          const repName = app.representativeName || initialProfile.representativeName || [repFirst, repMiddle, repLast, repSuffix].filter(Boolean).join(" ") || initialProfile.fullName;
          const repPos = app.representativePosition || initialProfile.designation || initialProfile.position || "";
          const initialStreet = [initialProfile.unit, initialProfile.street].filter(Boolean).join(", ");
          return {
            ...app,
            firstName: app.firstName || initialProfile.firstName,
            lastName: app.lastName || initialProfile.lastName,
            middleName: app.middleName || initialProfile.middleName,
            suffix: app.suffix || initialProfile.suffix,
            email: app.email || initialProfile.email,
            contactNo: app.contactNo || initialProfile.phone,
            sex: app.sex || initialProfile.sex,
            civilStatus: app.civilStatus || initialProfile.civilStatus,
            nationality: app.nationality || initialProfile.nationality,
            zipCode: app.zipCode || initialProfile.zipCode,
            street: app.street || initialStreet,
            address: app.address || initialStreet,
            region: app.region || initialProfile.region,
            province: app.province || initialProfile.province,
            city: app.city || initialProfile.city,
            barangay: app.barangay || initialProfile.barangay,
            schoolName: app.schoolName || initialProfile.schoolAttended,
            courseDegree: app.courseDegree || initialProfile.courseTaken,
            yearGraduated: app.yearGraduated || initialProfile.yearGraduated,
            birthYear: isBlank ? initialProfile.birthYear : app.birthYear,
            birthMonth: isBlank ? initialProfile.birthMonth : app.birthMonth,
            birthDay: isBlank ? initialProfile.birthDay : app.birthDay,
            companyName: app.companyName || initialProfile.companyName,
            representativeFirstName: repFirst,
            representativeMiddleName: repMiddle,
            representativeLastName: repLast,
            representativeSuffix: repSuffix,
            representativeName: repName,
            representativePosition: repPos,
            dtiSecRegistration: app.dtiSecRegistration || "",
          };
        })
      );

      // 2. Enrich from backend database /api/v2/users/profile
      try {
        const dbRes = await api.get<unknown>("/api/v2/users/profile").catch((err) => {
          console.warn("[GeneralServiceWizard] Notice: Backend profile fetch failed or returned non-200. Using Clerk/local profile fallbacks.", err);
          return null;
        });
        if (!active || !dbRes) return;
        const resObj = typeof dbRes === "object" && dbRes !== null ? (dbRes as Record<string, unknown>) : {};
        const dbUser = (resObj.data && typeof resObj.data === "object") ? (resObj.data as Record<string, unknown>) : resObj;
        if (!dbUser) return;

        const enriched = extractUserProfile(clerkUser, dbUser);
        setApplicants((prev) =>
          prev.map((app, idx) => {
            if (idx !== 0) return app;
            const isBlank = !app.firstName && !app.lastName && !app.email && !app.contactNo && !app.selectedVariantId;
            const repFirst = app.representativeFirstName || enriched.representativeFirstName || enriched.firstName || enriched.fullName.split(" ")[0] || "";
            const repMiddle = app.representativeMiddleName || enriched.representativeMiddleName || enriched.middleName || "";
            const repLast = app.representativeLastName || enriched.representativeLastName || enriched.lastName || enriched.fullName.split(" ").slice(1).join(" ") || "";
            const repSuffix = app.representativeSuffix || enriched.representativeSuffix || enriched.suffix || "";
            const repName = app.representativeName || enriched.representativeName || [repFirst, repMiddle, repLast, repSuffix].filter(Boolean).join(" ") || enriched.fullName;
            const repPos = app.representativePosition || enriched.designation || enriched.position || "";
            const enrichedStreet = [enriched.unit, enriched.street].filter(Boolean).join(", ");
            return {
              ...app,
              firstName: app.firstName || enriched.firstName,
              lastName: app.lastName || enriched.lastName,
              middleName: app.middleName || enriched.middleName,
              suffix: app.suffix || enriched.suffix,
              email: app.email || enriched.email,
              contactNo: app.contactNo || enriched.phone,
              sex: app.sex || enriched.sex,
              civilStatus: app.civilStatus || enriched.civilStatus,
              nationality: app.nationality || enriched.nationality,
              zipCode: app.zipCode || enriched.zipCode,
              street: app.street || enrichedStreet,
              address: app.address || enrichedStreet,
              region: app.region || enriched.region,
              province: app.province || enriched.province,
              city: app.city || enriched.city,
              barangay: app.barangay || enriched.barangay,
              schoolName: app.schoolName || enriched.schoolAttended,
              courseDegree: app.courseDegree || enriched.courseTaken,
              yearGraduated: app.yearGraduated || enriched.yearGraduated,
              birthYear: isBlank ? enriched.birthYear : app.birthYear,
              birthMonth: isBlank ? enriched.birthMonth : app.birthMonth,
              birthDay: isBlank ? enriched.birthDay : app.birthDay,
              companyName: app.companyName || enriched.companyName,
              representativeFirstName: repFirst,
              representativeMiddleName: repMiddle,
              representativeLastName: repLast,
              representativeSuffix: repSuffix,
              representativeName: repName,
              representativePosition: repPos,
              dtiSecRegistration: app.dtiSecRegistration || "",
            };
          })
        );
        hasPrefilledProfileRef.current = true;
      } catch (err) {
        console.warn("[GeneralServiceWizard] Failed to process backend profile data:", err);
      }
    }

    loadUserProfileForPrefill();
    return () => {
      active = false;
    };
  }, [clerkUser]);

  interface ApiResponseEnvelope<T> {
    succeeded?: boolean;
    data?: T;
    items?: T;
  }

  const hasFetchedTenantsRef = React.useRef(false);
  React.useEffect(() => {
    if (hasFetchedTenantsRef.current) return;
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<ApiResponseEnvelope<TenantInfo[]> | TenantInfo[]>("/api/v2/tenants?pageSize=100&isActive=true");
        let list: TenantInfo[] = [];
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          list = res.items;
        }
        setTenants(list);
        if (list.length > 0 && !selectedRegionId) {
          setSelectedRegionId(list[0].id);
        }
        hasFetchedTenantsRef.current = true;
      } catch (err) {
        console.error("Failed to fetch tenants from API:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  React.useEffect(() => {
    async function fetchOffices() {
      if (!selectedRegionId) {
        setOffices([]);
        return;
      }
      setLoadingOffices(true);
      try {
        const res = await api
          .get<ApiResponseEnvelope<OfficeInfo[]> | OfficeInfo[]>(`/api/v2/tenants/${selectedRegionId}/field-offices?isActive=true`)
          .catch(async () => {
            return await api.get<ApiResponseEnvelope<OfficeInfo[]> | OfficeInfo[]>(`/api/v2/field-offices?tenantId=${selectedRegionId}&isActive=true`).catch(() => null);
          });

        let officeList: OfficeInfo[] = [];
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          officeList = res.data;
        } else if (Array.isArray(res)) {
          officeList = res;
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          officeList = res.items;
        }
        setOffices(officeList);
        if (officeList.length > 0) {
          setSelectedOfficeId(officeList[0].id);
        } else {
          setSelectedOfficeId("");
        }
      } catch (err) {
        console.error("Failed to fetch offices from API:", err);
        setOffices([]);
      } finally {
        setLoadingOffices(false);
      }
    }
    fetchOffices();
  }, [selectedRegionId]);

  const updateActiveApplicant = (
    fields: Partial<GeneralApplicantData> | ((prevApp: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => {
    setApplicants((prev) =>
      prev.map((app, idx) => {
        if (idx !== currentApplicantIndex) return app;
        const resolved = typeof fields === "function" ? fields(app) : fields;
        return { ...app, ...resolved };
      })
    );
  };

  const submitApplicationPayload = async (isDraft = false) => {
    if (!isDraft) {
      const incompleteCount = applicants.filter(
        (app) => !isGeneralApplicantComplete(app, service, variantRequirements)
      ).length;
      if (incompleteCount > 0) {
        throw new Error(
          `Cannot submit: ${incompleteCount} of ${applicants.length} applicant(s) are incomplete. Please complete all required personal details and document uploads before submitting.`
        );
      }
    }

    const flatFormFields = form?.sections?.flatMap((s) => s.fields || []) || [];
    let mappedApplicants: ReturnType<typeof serializeCertificateApplicant>[] = [];
    try {
      mappedApplicants = applicants.map((app) =>
        serializeCertificateApplicant(app, service, flatFormFields)
      );
    } catch (serializationErr: unknown) {
      const serializationMsg =
        serializationErr instanceof Error
          ? serializationErr.message
          : "Failed to serialize applicant form data.";
      throw new Error(`Data Serialization Error: ${serializationMsg}`);
    }

    let effectiveScheduleId = selectedScheduleId && isGuid(selectedScheduleId) ? selectedScheduleId : undefined;

    if (!effectiveScheduleId && isExamService) {
      const openSched = schedules.find((s) => isScheduleOpenForFiling(s) && isGuid(s.id));
      if (openSched) {
        effectiveScheduleId = openSched.id;
        setSelectedScheduleId(effectiveScheduleId);
      } else if (selectedRegionId && service?.id) {
        try {
          const fetchedSchedules = await api
            .get<unknown>(
              `/api/v2/schedules/client-view?serviceId=${service.id}&tenantId=${selectedRegionId}&pageSize=50`
            )
            .catch(async () => {
              return await api
                .get<unknown>(
                  `/api/v2/schedules?serviceId=${service.id}&tenantId=${selectedRegionId}&pageSize=50`
                )
                .catch(() => null);
            });

          const isRecord = (val: unknown): val is Record<string, unknown> =>
            typeof val === "object" && val !== null;

          const dataObj = isRecord(fetchedSchedules) ? fetchedSchedules : {};
          const rawItems = Array.isArray(fetchedSchedules)
            ? fetchedSchedules
            : Array.isArray(dataObj.items)
            ? dataObj.items
            : Array.isArray(dataObj.data)
            ? dataObj.data
            : [];

          for (const rawItem of rawItems) {
            if (isRecord(rawItem) && rawItem.id && isGuid(String(rawItem.id))) {
              const startApp = typeof rawItem.startApplication === "string" ? rawItem.startApplication : null;
              const endApp =
                typeof rawItem.endApplication === "string"
                  ? rawItem.endApplication
                  : typeof rawItem.applicationDeadline === "string"
                  ? rawItem.applicationDeadline
                  : null;
              if (isScheduleOpenForFiling({ startApplication: startApp, endApplication: endApp })) {
                effectiveScheduleId = String(rawItem.id);
                setSelectedScheduleId(effectiveScheduleId);
                break;
              }
            }
          }
        } catch (fetchErr) {
          console.warn("[useGeneralServiceWizard] Could not resolve schedule for exam submission:", fetchErr);
        }
      }
    }

    if (isExamService && !isDraft && (!effectiveScheduleId || !isGuid(effectiveScheduleId))) {
      throw new Error(
        "Examination Schedule is required for exam service applications. Please select an open Examination Schedule & Venue before submitting."
      );
    }

    if (!isDraft) {
      const effectiveRequirements: Array<ServiceRequirementItem | string> =
        variantRequirements && variantRequirements.length > 0
          ? variantRequirements
          : service.requirements && service.requirements.length > 0
          ? service.requirements
          : [];

      const mandatoryList = effectiveRequirements
        .map((req, idx) => ({ req, idx }))
        .filter(({ req }) => isRequirementMandatory(req));

      if (mandatoryList.length > 0) {
        const applicantsToValidate =
          appMode === "BULK" || mappedApplicants.length > 1 ? applicants : [activeApplicant];

        for (let i = 0; i < applicantsToValidate.length; i++) {
          const appToVal = applicantsToValidate[i];
          const missing = mandatoryList.filter(
            ({ req, idx }) => !isRequirementUploaded(req, idx, appToVal.uploads)
          );
          if (missing.length > 0) {
            const missingNames = missing.map(({ req, idx }) => {
              if (typeof req === "string") return req.replace(/\*$/, "").trim();
              return (req.name || req.label || req.title || `Requirement #${idx + 1}`).replace(/\*$/, "").trim();
            });
            const applicantLabel =
              [appToVal.firstName, appToVal.lastName].filter(Boolean).join(" ") || `Applicant #${i + 1}`;
            throw new Error(
              `Mandatory supporting documents are missing for ${applicantLabel}: ${missingNames.join(", ")}. Please upload all required attachments before submitting.`
            );
          }
        }
      }
    }

    const payload = {
      tenantId: selectedRegionId,
      submissionMode: appMode === "BULK" || mappedApplicants.length > 1 ? "Bulk" : "Single",
      intent: filingIntent,
      serviceId: service.id,
      fieldOfficeId: selectedOfficeId,
      serviceVariantId: activeApplicant.selectedVariantId || (variants.length > 0 ? variants[0].id : null),
      serviceVariantElementIds: [],
      scheduleId: effectiveScheduleId || (isExamService ? null : undefined),
      isDraft: true,
      applicants: mappedApplicants,
    };

    try {
      const submitRes = await api.post<unknown>(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
      const resObj = typeof submitRes === "object" && submitRes !== null ? (submitRes as Record<string, unknown>) : {};
      const applicationId =
        typeof submitRes === "string" && submitRes.trim() !== ""
          ? submitRes
          : resObj.succeeded === true && typeof resObj.data === "string"
          ? resObj.data
          : typeof resObj.id === "string"
          ? resObj.id
          : null;

      if (!applicationId) {
        throw new Error("Application creation returned no identifier.");
      }

      const allApplicantsForUpload = appMode === "BULK" || mappedApplicants.length > 1 ? applicants : [activeApplicant];
      await uploadRequirementsAfterSubmit({
        api,
        applicationId,
        tenantId: selectedRegionId,
        applicants: allApplicantsForUpload,
        getToken,
      });

      if (!isDraft) {
        const finalizeRes = await api.post<unknown>(`/api/v2/applications/${applicationId}/submit`, {});
        const finObj = typeof finalizeRes === "object" && finalizeRes !== null ? (finalizeRes as Record<string, unknown>) : {};
        if (finObj.succeeded === false) {
          throw new Error((typeof finObj.message === "string" && finObj.message) || "Failed to finalize application submission.");
        }
      }
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err) || "Network request failed while submitting application.");
    }
  };

  const submitFeedback = async (rating: number, comment: string) => {
    if (rating <= 0) return;
    try {
      const applicantName =
        [activeApplicant.firstName, activeApplicant.lastName].filter(Boolean).join(" ") || "Applicant";
      const applicantEmail = activeApplicant.email || "applicant@domain.com";

      await api.post("/api/v2/feedback", {
        senderName: applicantName,
        senderEmail: applicantEmail,
        subject: `Filing Feedback - ${service.title || "NTC Service"}`,
        message:
          comment && comment.trim().length > 0
            ? comment.trim()
            : `Applicant rated filing experience ${rating}/5 stars.`,
        rating: rating,
        isAnonymous: false,
      });
    } catch (err) {
      console.warn("Failed to submit feedback:", err);
    }
  };

  return {
    activeApplicant,
    updateActiveApplicant,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
    isExamService,
    schedules,
    loadingSchedules,
    selectedScheduleId,
    setSelectedScheduleId,
    variants,
    loadingVariants,
    variantElements,
    loadingElements,
    variantRequirements,
    loadingRequirements,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    setIsSubmitting,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackRating,
    setFeedbackRating,
    feedbackComment,
    setFeedbackComment,
    filingIntent,
    setFilingIntent,
    submitApplicationPayload,
    submitFeedback,
  };
}
