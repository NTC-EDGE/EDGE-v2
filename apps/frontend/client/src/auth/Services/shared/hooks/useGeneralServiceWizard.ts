import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/expo";
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
} from "../../permits";
import { extractUserProfile } from "../../../../shared/utils/userProfileHelper";

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

export interface GeneralApplicantData {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  applicantType?: "individual" | "company";
  companyName?: string;
  representativeName?: string;
  email: string;
  contactNo: string;
  sex?: string;
  nationality?: string;
  zipCode?: string;
  address: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  notes: string;
  selectedVariantId?: string;
  selectedElementId?: string;
  selectedElementTitle?: string;
  uploads: Record<string, { name: string; uri: string } | string>;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  // Specialized Certificate, License & Permit Models
  radioCertData?: RadioOperatorCertData;
  deviceRegData?: DeviceRegistrationData;
  tvroRegData?: TVRORegistrationData;
  vasData?: VASProviderData;
  copyOfCertData?: CopyOfCertificateData;
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
  representativeName: "",
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
  amateurLicenseData: initialAmateurRadioStationLicenseData(id),
  lifetimeLicenseData: initialLifetimeAmateurLicenseData(id),
  permitData: initialAmateurPermitData(id),
});

export const isGeneralApplicantComplete = (
  app: GeneralApplicantData,
  service?: NTCService,
  variantRequirements: string[] = []
): boolean => {
  // 1. Basic details (must have name, email, contact number)
  const hasFirstName = Boolean(app.firstName && app.firstName.trim().length > 0);
  const hasLastName = Boolean(app.lastName && app.lastName.trim().length > 0);
  const hasEmail = Boolean(app.email && app.email.trim().length > 0 && app.email.includes("@"));
  const hasContact = Boolean(app.contactNo && app.contactNo.trim().length > 0);

  if (!hasFirstName || !hasLastName || !hasEmail || !hasContact) {
    return false;
  }

  // 2. Document upload validation
  const uploads = app.uploads || {};
  const reqList =
    variantRequirements && variantRequirements.length > 0
      ? variantRequirements
      : service?.requirements && service.requirements.length > 0
      ? service.requirements
      : [];

  if (reqList.length > 0) {
    const allUploaded = reqList.every((req, idx) => {
      const file =
        uploads[req] ||
        uploads[`req-${idx}`] ||
        uploads[`req-gen-${idx}`] ||
        uploads[idx.toString()];

      if (!file) return false;
      if (typeof file === "string") return file.trim().length > 0;
      return !!(file.name || file.uri);
    });
    if (!allUploaded) {
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

  const isOptionsObject = typeof optionsOrService === "object" && "service" in optionsOrService;
  const service = isOptionsObject ? (optionsOrService as UseGeneralServiceWizardOptions).service : (optionsOrService as NTCService);
  const currentStep = isOptionsObject ? ((optionsOrService as UseGeneralServiceWizardOptions).step || 1) : stepArg;

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

  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);

  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantElements, setVariantElements] = useState<any[]>([]);
  const [loadingElements, setLoadingElements] = useState(false);

  // Lazy fetch variants when opening Step 3
  React.useEffect(() => {
    let active = true;
    const fetchStep3Variants = async () => {
      if ((currentStep !== 2 && currentStep !== 3) || !service?.id) return;
      try {
        setLoadingVariants(true);
        const varRes = await api.get<any>(`/api/v2/services/${service.id}/variants`).catch(() => null);
        if (active) {
          let fetchedVariants: any[] = [];
          if (varRes && varRes.succeeded && Array.isArray(varRes.data)) {
            fetchedVariants = varRes.data;
          } else if (Array.isArray(varRes)) {
            fetchedVariants = varRes;
          } else if (varRes && Array.isArray(varRes.items)) {
            fetchedVariants = varRes.items;
          }
          setVariants(fetchedVariants);

          // Auto-select initial variant if applicant has no variant selected yet
          if (fetchedVariants.length > 0) {
            const firstVariant = fetchedVariants[0];
            setApplicants((prev) =>
              prev.map((app, idx) =>
                idx === currentApplicantIndex && !app.selectedVariantId
                  ? {
                      ...app,
                      selectedVariantId: firstVariant.id,
                      selectedVariantName: firstVariant.name || firstVariant.description || "",
                    }
                  : app
              )
            );
          }
        }
      } catch (err) {
        console.warn("Failed to fetch service variants on Step 2/3:", err);
      } finally {
        if (active) setLoadingVariants(false);
      }
    };
    fetchStep3Variants();
    return () => { active = false; };
  }, [currentStep, service?.id]);

  // Fetch variant elements when a variant is selected in Step 2/3
  const activeApplicant = applicants[currentApplicantIndex] || initialGeneralApplicant(1);
  const effectiveVariantId = activeApplicant.selectedVariantId || (variants[0] ? variants[0].id : null);

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
          .get<any>(`/api/v2/service-variant-elements?serviceVariantId=${effectiveVariantId}`)
          .catch(async () => {
            return await api.get<any>(`/api/v2/services/${service.id}/variants/${effectiveVariantId}/elements`).catch(() => null);
          });

        if (active) {
          if (elRes && elRes.succeeded && Array.isArray(elRes.data)) {
            setVariantElements(elRes.data);
          } else if (Array.isArray(elRes)) {
            setVariantElements(elRes);
          } else if (elRes && Array.isArray(elRes.items)) {
            setVariantElements(elRes.items);
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
  }, [currentStep, effectiveVariantId, service?.id, variants]);

  // Fetch variant requirements when variant or service changes
  const [variantRequirements, setVariantRequirements] = useState<string[]>([]);
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
          .get<any>(`/api/v2/services/${service.id}/requirements?variantId=${effectiveVariantId || ""}`)
          .catch(async () => {
            return await api.get<any>(`/api/v2/service-variant-requirements?serviceVariantId=${effectiveVariantId || ""}`).catch(() => null);
          });

        if (active) {
          let list: string[] = [];
          if (reqRes && reqRes.succeeded && Array.isArray(reqRes.data)) {
            list = reqRes.data.map((r: any) => typeof r === "string" ? r : r.name || r.title || r.description || "");
          } else if (Array.isArray(reqRes)) {
            list = reqRes.map((r: any) => typeof r === "string" ? r : r.name || r.title || r.description || "");
          } else if (reqRes && Array.isArray(reqRes.items)) {
            list = reqRes.items.map((r: any) => typeof r === "string" ? r : r.name || r.title || r.description || "");
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
  }, [effectiveVariantId, service?.id, service?.requirements]);

  // Pre-fill user profile for single application
  React.useEffect(() => {
    let active = true;
    async function loadUserProfileForPrefill() {
      if (!clerkUser) return;

      // 1. Initial prefill from local storage / Clerk metadata
      const initialProfile = extractUserProfile(clerkUser, null);
      setApplicants((prev) =>
        prev.map((app, idx) => {
          if (idx !== 0) return app;
          return {
            ...app,
            firstName: app.firstName || initialProfile.firstName,
            lastName: app.lastName || initialProfile.lastName,
            middleName: app.middleName || initialProfile.middleName,
            suffix: app.suffix || initialProfile.suffix,
            email: app.email || initialProfile.email,
            contactNo: app.contactNo || initialProfile.phone,
            sex: app.sex || initialProfile.sex,
            nationality: app.nationality || initialProfile.nationality,
            zipCode: app.zipCode || initialProfile.zipCode,
            address: app.address || initialProfile.formattedAddress || [initialProfile.unit, initialProfile.street].filter(Boolean).join(", "),
            region: app.region || initialProfile.region,
            province: app.province || initialProfile.province,
            city: app.city || initialProfile.city,
            barangay: app.barangay || initialProfile.barangay,
            birthYear: app.birthYear && app.birthYear !== "2000" ? app.birthYear : initialProfile.birthYear,
            birthMonth: app.birthMonth && app.birthMonth !== "January" ? app.birthMonth : initialProfile.birthMonth,
            birthDay: app.birthDay && app.birthDay !== "1" ? app.birthDay : initialProfile.birthDay,
            companyName: app.companyName || initialProfile.companyName,
          };
        })
      );

      // 2. Enrich from backend database /api/v2/users/profile
      try {
        const dbRes = await api.get<any>("/api/v2/users/profile").catch(() => null);
        if (!active || !dbRes) return;
        const dbUser = (dbRes && dbRes.data) ? dbRes.data : dbRes;
        if (!dbUser) return;

        const enriched = extractUserProfile(clerkUser, dbUser);
        setApplicants((prev) =>
          prev.map((app, idx) => {
            if (idx !== 0) return app;
            return {
              ...app,
              firstName: app.firstName || enriched.firstName,
              lastName: app.lastName || enriched.lastName,
              middleName: app.middleName || enriched.middleName,
              suffix: app.suffix || enriched.suffix,
              email: app.email || enriched.email,
              contactNo: app.contactNo || enriched.phone,
              sex: app.sex || enriched.sex,
              nationality: app.nationality || enriched.nationality,
              zipCode: app.zipCode || enriched.zipCode,
              address: app.address || enriched.formattedAddress || [enriched.unit, enriched.street].filter(Boolean).join(", "),
              region: app.region || enriched.region,
              province: app.province || enriched.province,
              city: app.city || enriched.city,
              barangay: app.barangay || enriched.barangay,
              birthYear: app.birthYear && app.birthYear !== "2000" ? app.birthYear : enriched.birthYear,
              birthMonth: app.birthMonth && app.birthMonth !== "January" ? app.birthMonth : enriched.birthMonth,
              birthDay: app.birthDay && app.birthDay !== "1" ? app.birthDay : enriched.birthDay,
              companyName: app.companyName || enriched.companyName,
            };
          })
        );
      } catch (err) {
        // Fallback gracefully
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

  React.useEffect(() => {
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
      } catch (err) {
        console.error("Failed to fetch tenants from API:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, [selectedRegionId, setSelectedRegionId]);

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

    const mappedApplicants = applicants.map((app) =>
      serializeCertificateApplicant(app, service, [])
    );

    const payload = {
      tenantId: selectedRegionId,
      submissionMode: mappedApplicants.length > 1 ? "Bulk" : "Single",
      serviceId: service.id,
      fieldOfficeId: selectedOfficeId,
      serviceVariantId: activeApplicant.selectedVariantId || (variants.length > 0 ? variants[0].id : null),
      serviceVariantElementIds: [],
      isDraft: isDraft,
      applicants: mappedApplicants,
    };

    try {
      await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err));
    }
  };

  return {
    activeApplicant,
    updateActiveApplicant,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
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
    submitApplicationPayload,
  };
}
