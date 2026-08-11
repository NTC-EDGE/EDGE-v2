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

interface UseGeneralServiceWizardProps {
  service: NTCService;
  selectedRegionId: string;
  selectedOfficeId: string;
  applicants: GeneralApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex: number;
}

export function useGeneralServiceWizard({
  service,
  selectedRegionId,
  selectedOfficeId,
  applicants,
  setApplicants,
  currentApplicantIndex,
}: UseGeneralServiceWizardProps) {
  const api = useApi();
  const { user: clerkUser } = useUser();
  const USE_MOCKS = false;

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

  const [formFields, setFormFields] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchFormAndVariants = async () => {
      if (!service.id) return;
      try {
        setLoadingVariants(true);
        const [formRes, varRes] = await Promise.all([
          api.get<any>(`/api/v2/services/${service.id}/form`).catch(() => null),
          api.get<any>(`/api/v2/services/${service.id}/variants`).catch(() => null),
        ]);

        if (active) {
          if (formRes && formRes.data && formRes.data.sections) {
            const fields = formRes.data.sections.flatMap((s: any) => s.fields || []);
            setFormFields(fields);
          }

          if (varRes && varRes.succeeded && Array.isArray(varRes.data)) {
            setVariants(varRes.data);
          } else if (Array.isArray(varRes)) {
            setVariants(varRes);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch general service form or variants:", err);
      } finally {
        if (active) setLoadingVariants(false);
      }
    };
    fetchFormAndVariants();
    return () => { active = false; };
  }, [service.id]);

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

  const activeApplicant = applicants[currentApplicantIndex] || initialGeneralApplicant(1);

  const updateActiveApplicant = (fields: Partial<GeneralApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };



  const submitApplicationPayload = async (isDraft = false) => {
    const monthMap: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };

    const mappedApplicants = applicants.map((app) =>
      serializeCertificateApplicant(app, service, formFields)
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
