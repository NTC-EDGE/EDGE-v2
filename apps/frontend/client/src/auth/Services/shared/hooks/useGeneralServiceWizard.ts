import React, { useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../../shared/hooks/useApi";
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

export interface TenantInfo {
  id: string;
  name: string;
}

export interface OfficeInfo {
  id: string;
  name: string;
}

export interface GeneralApplicantData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  address: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  notes: string;
  selectedVariantId?: string;
  uploads: Record<string, { name: string; uri: string } | string>;
  // Specialized Certificate & License Models
  radioCertData?: RadioOperatorCertData;
  deviceRegData?: DeviceRegistrationData;
  tvroRegData?: TVRORegistrationData;
  vasData?: VASProviderData;
  copyOfCertData?: CopyOfCertificateData;
  amateurLicenseData?: AmateurRadioStationLicenseData;
  lifetimeLicenseData?: LifetimeAmateurLicenseData;
}

export const initialGeneralApplicant = (id: number): GeneralApplicantData => ({
  id,
  firstName: "",
  lastName: "",
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
});

export interface UseGeneralServiceWizardOptions {
  service: NTCService;
  selectedRegionId?: string | null;
  selectedOfficeId?: string | null;
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

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
    isOptionsObject ? (optionsOrService as UseGeneralServiceWizardOptions).selectedRegionId || null : null
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(
    isOptionsObject ? (optionsOrService as UseGeneralServiceWizardOptions).selectedOfficeId || null : null
  );

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
      if (currentStep !== 3 || !service?.id) return;
      try {
        setLoadingVariants(true);
        const varRes = await api.get<any>(`/api/v2/services/${service.id}/variants`).catch(() => null);
        if (active) {
          if (varRes && varRes.succeeded && Array.isArray(varRes.data)) {
            setVariants(varRes.data);
          } else if (Array.isArray(varRes)) {
            setVariants(varRes);
          } else {
            setVariants([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch service variants on Step 3:", err);
      } finally {
        if (active) setLoadingVariants(false);
      }
    };
    fetchStep3Variants();
    return () => { active = false; };
  }, [currentStep, service?.id]);

  // Fetch variant elements when a variant is selected in Step 3
  const activeApplicant = applicants[currentApplicantIndex] || initialGeneralApplicant(1);
  const activeVariantId = activeApplicant.selectedVariantId || (variants[0] ? variants[0].id : null);

  React.useEffect(() => {
    let active = true;
    const fetchVariantElements = async () => {
      if (currentStep !== 3 || !activeVariantId || !service?.id) {
        if (active) setVariantElements([]);
        return;
      }
      try {
        setLoadingElements(true);
        const elRes = await api
          .get<any>(`/api/v2/services/${service.id}/variants/${activeVariantId}/elements`)
          .catch(async () => {
            return await api.get<any>(`/api/v2/variants/${activeVariantId}/elements`).catch(() => null);
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
  }, [currentStep, activeVariantId, service?.id]);

  // Pre-fill user profile
  React.useEffect(() => {
    if (clerkUser && applicants.length === 1) {
      const firstApp = applicants[0];
      if (firstApp && firstApp.firstName === "" && firstApp.lastName === "" && firstApp.email === "") {
        setApplicants((prev) =>
          prev.map((app, idx) =>
            idx === 0
              ? {
                  ...app,
                  firstName: clerkUser.firstName || "",
                  lastName: clerkUser.lastName || "",
                  email: clerkUser.primaryEmailAddress?.emailAddress || "",
                  contactNo: clerkUser.primaryPhoneNumber?.phoneNumber || "",
                }
              : app
          )
        );
      }
    }
  }, [clerkUser, applicants, setApplicants]);

  interface ApiResponseEnvelope<T> {
    succeeded?: boolean;
    data?: T;
    items?: T;
  }

  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<ApiResponseEnvelope<TenantInfo[]> | TenantInfo[]>("/api/v2/tenants");
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setTenants(res.data);
        } else if (Array.isArray(res)) {
          setTenants(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setTenants(res.items);
        } else {
          setTenants([]);
        }
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
        const res = await api.get<ApiResponseEnvelope<OfficeInfo[]> | OfficeInfo[]>(`/api/v2/tenants/${selectedRegionId}/field-offices`);
        if (res && !Array.isArray(res) && res.succeeded && Array.isArray(res.data)) {
          setOffices(res.data);
        } else if (Array.isArray(res)) {
          setOffices(res);
        } else if (res && !Array.isArray(res) && Array.isArray(res.items)) {
          setOffices(res.items);
        } else {
          setOffices([]);
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

  const updateActiveApplicant = (fields: Partial<GeneralApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };

  const submitApplicationPayload = async (isDraft = false) => {
    const mappedApplicants = applicants.map((app) =>
      serializeCertificateApplicant(app, service, [])
    );

    const payload = {
      tenantId: selectedRegionId,
      submissionMode: "Single",
      serviceId: service.id,
      fieldOfficeId: selectedOfficeId,
      serviceVariantId: activeApplicant.selectedVariantId || (variants.length > 0 ? variants[0].id : null),
      serviceVariantElementIds: [],
      isDraft: isDraft,
      applicants: mappedApplicants,
    };

    await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
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
