import React, { useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../../shared/hooks/useApi";
import { NTCService } from "../../data/servicesData";

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
  uploads: Record<string, { name: string; uri: string } | string>;
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
  uploads: {},
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

  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const data = await api.get<{ items?: TenantInfo[] } | TenantInfo[]>("/api/v2/tenants");
        setTenants(Array.isArray(data) ? data : (data.items || []));
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
        const data = await api.get<{ items?: OfficeInfo[] } | OfficeInfo[]>(`/api/v2/tenants/${selectedRegionId}/field-offices`);
        setOffices(Array.isArray(data) ? data : (data.items || []));
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



  const submitApplicationPayload = async () => {
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

    const mappedApplicants = applicants.map((app) => {
      const address = app.address || "N/A";
      const birthDate = `${app.birthYear}-${monthMap[app.birthMonth] || "01"}-${app.birthDay.padStart(2, "0")}T00:00:00Z`;

      const formFieldValues = [
        { fieldName: "Notes", fieldValue: app.notes || "N/A" },
      ];

      return {
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        contactNumber: app.contactNo,
        address: address,
        birthDate: birthDate,
        formFieldValues,
      };
    });

    const payload = {
      applicationType: "GENERAL_SERVICE",
      serviceCategory: service.category ?? service.title,
      serviceId: service.id ?? service.title,
      fieldOfficeId: selectedOfficeId,
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
