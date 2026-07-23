import React, { useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useAuth, useUser } from "@clerk/expo";
import { apiClient } from "@edge/api";
import { NTCService } from "../../data/servicesData";
import { PHILIPPINE_REGIONS_WITH_OFFICES } from "../../accreditation/customer-premises/data/mockRegionData";

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
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const USE_MOCKS = true;

  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [activeUploadSlot, setActiveUploadSlot] = useState<string | null>(null);
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

  // Fetch tenants
  React.useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        if (USE_MOCKS) {
          const mockTenants = PHILIPPINE_REGIONS_WITH_OFFICES.map((r) => ({
            id: r.id,
            name: r.name,
          }));
          setTenants(mockTenants);
          return;
        }
        const token = await getToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get("/api/v2/tenants", { headers });
        const data = response.data;
        setTenants(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  // Fetch offices
  React.useEffect(() => {
    async function fetchOffices() {
      if (!selectedRegionId) {
        setOffices([]);
        return;
      }
      setLoadingOffices(true);
      try {
        if (USE_MOCKS) {
          const region = PHILIPPINE_REGIONS_WITH_OFFICES.find((r) => r.id === selectedRegionId);
          setOffices(region ? region.offices : []);
          return;
        }
        const token = await getToken();
        const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiClient.get("/api/v2/field-offices", {
          params: { regionId: selectedRegionId },
          headers,
        });
        const data = response.data;
        setOffices(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Failed to fetch offices:", err);
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

  const handleDocumentPick = async () => {
    if (!activeUploadSlot) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const currentUploads = { ...activeApplicant.uploads };
        currentUploads[activeUploadSlot] = { name: file.name, uri: file.uri };
        updateActiveApplicant({ uploads: currentUploads });
        setIsUploadSheetOpen(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleCameraLaunch = async () => {
    if (!activeUploadSlot) return;
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera access is required to scan documents.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const currentUploads = { ...activeApplicant.uploads };
        const fileName = file.fileName || `scanned_doc_${Date.now()}.jpg`;
        currentUploads[activeUploadSlot] = { name: fileName, uri: file.uri };
        updateActiveApplicant({ uploads: currentUploads });
        setIsUploadSheetOpen(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to launch camera.");
    }
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

    const token = await getToken();
    const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};
    await apiClient.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload, { headers });
  };

  return {
    activeApplicant,
    updateActiveApplicant,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
    isUploadSheetOpen,
    setIsUploadSheetOpen,
    activeUploadSlot,
    setActiveUploadSlot,
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
    handleDocumentPick,
    handleCameraLaunch,
    submitApplicationPayload,
  };
}
