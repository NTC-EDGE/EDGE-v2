import { useState, useMemo } from "react";
import axios from "axios";
import { Alert, useWindowDimensions, Platform } from "react-native";
import { useAppNavigation } from "../../../navigation";
import { useUser, useAuth } from "@clerk/expo";
import { useApi } from "../../../shared/hooks/useApi";
import { NTCService } from "../data/servicesData";
import { initialDrafts } from "../data/initialDrafts";
import {
  ApplicantData,
  initialApplicant,
} from "../accreditation/customer-premises";
import {
  ExamApplicantData,
  initialExamApplicant,
} from "../exams/radio-operator";
import {
  GeneralApplicantData,
  initialGeneralApplicant,
} from "../shared/GeneralServiceWizard";

export interface DraftApplication {
  id: string;
  wizardService: "cpe-accreditation" | "radio-operator-exam" | "general-service";
  service: NTCService | null;
  step: number;
  selectedRegionId: string;
  selectedOfficeId: string;
  appMode: "SINGLE" | "BULK" | "";
  bulkMethod: "MANUAL" | "EXCEL";
  isFileUploaded: boolean;
  uploadedFileName: string;
  applicants: any[];
  examApplicants: any[];
  generalApplicants: any[];
  currentApplicantIndex: number;
  currentExamApplicantIndex: number;
  currentGeneralApplicantIndex: number;
  timestamp: string;
}

export function useServices() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const navigation = useAppNavigation();
  const api = useApi();

  // Clerk Contexts
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedService, setSelectedService] = useState<NTCService | null>(
    null,
  );
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeWizardService, setActiveWizardService] = useState<string | null>(
    null,
  );
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Backend Categories Query
  const { data: categoriesApiResponse } = api.useQuery<{ succeeded: boolean; data: any[] }>("/api/v2/service-categories");
  const backendCategories = categoriesApiResponse?.succeeded ? categoriesApiResponse.data : null;

  // Backend Services Query (all services for counting)
  const { data: allServicesApiResponse } = api.useQuery<{ succeeded: boolean; data: any[] }>("/api/v2/services?pageSize=9999");
  const allBackendServices = allServicesApiResponse?.succeeded ? allServicesApiResponse.data : null;

  // Backend Services Query (filtered by selected category's serviceId as serviceCategoryId)
  const { data: servicesApiResponse } = api.useQuery<{ succeeded: boolean; data: any[] }>(
    serviceId ? `/api/v2/services?serviceCategoryId=${serviceId}&pageSize=9999` : null
  );
  const backendServices = servicesApiResponse?.succeeded ? servicesApiResponse.data : null;

  // Shared Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [appMode, setAppMode] = useState<"SINGLE" | "BULK" | "">("");

  // Navigation Guard confirmation states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<(() => void) | null>(null);
  const [bulkMethod, setBulkMethod] = useState<"MANUAL" | "EXCEL">("MANUAL");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [applicants, setApplicants] = useState<ApplicantData[]>([
    initialApplicant(1),
  ]);
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0);
  const [examWizardStep, setExamWizardStep] = useState(1);
  const [examApplicants, setExamApplicants] = useState<ExamApplicantData[]>([
    initialExamApplicant(1),
  ]);
  const [currentExamApplicantIndex, setCurrentExamApplicantIndex] = useState(0);
  const [isBulkSubmitOpen, setIsBulkSubmitOpen] = useState(false);

  const [generalApplicants, setGeneralApplicants] = useState<GeneralApplicantData[]>([
    initialGeneralApplicant(1),
  ]);
  const [currentGeneralApplicantIndex, setCurrentGeneralApplicantIndex] = useState(0);

  const [drafts, setDrafts] = useState<DraftApplication[]>(initialDrafts);
  const [viewingDraftsCategory, setViewingDraftsCategory] = useState<string | null>(null);

  const resetWizardState = () => {
    setWizardStep(1);
    setExamWizardStep(1);
    setSelectedRegionId("");
    setSelectedOfficeId("");
    setAppMode("");
    setBulkMethod("MANUAL");
    setIsFileUploaded(false);
    setUploadedFileName("");
    setApplicants([initialApplicant(1)]);
    setExamApplicants([initialExamApplicant(1)]);
    setGeneralApplicants([initialGeneralApplicant(1)]);
    setCurrentApplicantIndex(0);
    setCurrentExamApplicantIndex(0);
    setCurrentGeneralApplicantIndex(0);
    setIsBulkSubmitOpen(false);
    setServiceId(null);
  };

  const saveActiveAsDraft = async () => {
    if (!activeWizardService) return;

    const draftId = `draft-${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newDraft: DraftApplication = {
      id: draftId,
      wizardService: activeWizardService as any,
      service: selectedService,
      step: activeWizardService === "radio-operator-exam" ? examWizardStep : wizardStep,
      selectedRegionId,
      selectedOfficeId,
      appMode,
      bulkMethod,
      isFileUploaded,
      uploadedFileName,
      applicants,
      examApplicants,
      generalApplicants,
      currentApplicantIndex,
      currentExamApplicantIndex,
      currentGeneralApplicantIndex,
      timestamp: formattedDate,
    };

    setDrafts((prev) => [newDraft, ...prev.filter((d) => d.id !== draftId)]);

    if (!selectedRegionId) {
      Alert.alert("Success", "Draft saved locally. (Select a region to save to server)");
      return;
    }

    try {
      const months: Record<string, string> = {
        January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
        July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
      };

      let mappedApplicants: Array<{
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
        address: string;
        birthDate: string;
        formFieldValues: Array<{ fieldId: string; value: string }>;
      }> = [];
      let svId: string | null = null;
      let sveIds: string[] = [];

      if (activeWizardService === "cpe-accreditation") {
        mappedApplicants = applicants.map(app => ({
          firstName: "CPE Supplier",
          lastName: app.businessName || "Draft",
          email: app.email || "draft@example.com",
          contactNumber: app.contactNo || "",
          address: `${app.unitBldgNo || ""}, ${app.street || ""}, ${app.barangay || ""}, ${app.city || ""}, ${app.province || ""}` || "N/A",
          birthDate: "1990-01-01T00:00:00Z",
          formFieldValues: []
        }));
      } else if (activeWizardService === "radio-operator-exam") {
        const activeApp = examApplicants[currentExamApplicantIndex];
        if (activeApp) {
          svId = activeApp.selectedVariantId || null;
          sveIds = activeApp.selectedElementId ? [activeApp.selectedElementId] : [];
        }
        mappedApplicants = examApplicants.map(app => {
          const monthNum = months[app.birthMonth] || "01";
          const day = (app.birthDay || "1").padStart(2, '0');
          return {
            firstName: app.firstName || "Draft",
            lastName: app.lastName || "Applicant",
            email: app.email || "draft@example.com",
            contactNumber: app.contactNo || "",
            address: `${app.street || ""}, ${app.barangay || ""}, ${app.city || ""}, ${app.province || ""}` || "N/A",
            birthDate: app.birthYear ? `${app.birthYear}-${monthNum}-${day}T00:00:00Z` : "1990-01-01T00:00:00Z",
            formFieldValues: []
          };
        });
      } else if (activeWizardService === "general-service") {
        mappedApplicants = generalApplicants.map(app => {
          const monthNum = months[app.birthMonth] || "01";
          const day = (app.birthDay || "1").padStart(2, '0');
          return {
            firstName: app.firstName || "Draft",
            lastName: app.lastName || "Applicant",
            email: app.email || "draft@example.com",
            contactNumber: app.contactNo || "",
            address: app.address || "N/A",
            birthDate: app.birthYear ? `${app.birthYear}-${monthNum}-${day}T00:00:00Z` : "1990-01-01T00:00:00Z",
            formFieldValues: []
          };
        });
      }

      const payload = {
        tenantId: selectedRegionId,
        submissionMode: appMode === "BULK" ? "Bulk" : "Single",
        serviceId: selectedService?.id || null,
        scheduleId: null,
        fieldOfficeId: selectedOfficeId || null,
        serviceVariantId: svId,
        serviceVariantElementIds: sveIds,
        isDraft: true,
        applicants: mappedApplicants,
      };

      await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
      Alert.alert("Success", "Draft saved to server successfully.");
    } catch (err) {
      console.error("Failed to save draft to backend:", err);
      Alert.alert("Partial Success", "Draft saved locally, but failed to sync to server.");
    }
  };

  const loadDraft = (draft: DraftApplication) => {
    // Close the drafts modal immediately to avoid native modal collision
    setViewingDraftsCategory(null);

    // Slightly delay the confirmation dialog to allow drafts modal to finish transition
    setTimeout(() => {
      confirmSwitchService(() => {
        setActiveWizardService(draft.wizardService);
        setSelectedService(draft.service);
        
        // Start draft from Step 1 so the user can verify or change the initial settings (region, office, appMode)
        setWizardStep(1);
        setExamWizardStep(1);
        setSelectedRegionId(draft.selectedRegionId);
        setSelectedOfficeId(draft.selectedOfficeId);
        setAppMode(draft.appMode);
        setBulkMethod(draft.bulkMethod);
        setIsFileUploaded(draft.isFileUploaded);
        setUploadedFileName(draft.uploadedFileName);
        setApplicants(draft.applicants.length > 0 ? draft.applicants : [initialApplicant(1)]);
        setExamApplicants(draft.examApplicants.length > 0 ? draft.examApplicants : [initialExamApplicant(1)]);
        setGeneralApplicants(draft.generalApplicants.length > 0 ? draft.generalApplicants : [initialGeneralApplicant(1)]);
        setCurrentApplicantIndex(draft.currentApplicantIndex);
        setCurrentExamApplicantIndex(draft.currentExamApplicantIndex);
        setCurrentGeneralApplicantIndex(draft.currentGeneralApplicantIndex);
      });
    }, Platform.OS === "web" ? 0 : 300);
  };

  const handleAddGeneralApplicant = () => {
    const nextId = generalApplicants.length + 1;
    const newApp = initialGeneralApplicant(nextId);
    setGeneralApplicants((prev) => [...prev, newApp]);
    setCurrentGeneralApplicantIndex(generalApplicants.length);
    setWizardStep(4);
  };

  const handleRemoveGeneralApplicant = (idx: number) => {
    setGeneralApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) {
        setCurrentGeneralApplicantIndex(0);
        return [initialGeneralApplicant(1)];
      }
      setCurrentGeneralApplicantIndex((prevIdx) =>
        Math.max(0, Math.min(prevIdx, updated.length - 1)),
      );
      return updated;
    });
  };

  const handleAddExamApplicant = () => {
    const nextId = examApplicants.length + 1;
    const newApp = initialExamApplicant(nextId);
    setExamApplicants((prev) => [...prev, newApp]);
    setCurrentExamApplicantIndex(examApplicants.length);
    setExamWizardStep(3);
  };

  const handleRemoveExamApplicant = (idx: number) => {
    setExamApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) {
        setCurrentExamApplicantIndex(0);
        return [initialExamApplicant(1)];
      }
      setCurrentExamApplicantIndex((prevIdx) =>
        Math.max(0, Math.min(prevIdx, updated.length - 1)),
      );
      return updated;
    });
  };

  const handleRemoveApplicant = (idx: number) => {
    setApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) {
        setCurrentApplicantIndex(0);
        return [initialApplicant(1)];
      }
      setCurrentApplicantIndex((prevIdx) =>
        Math.max(0, Math.min(prevIdx, updated.length - 1)),
      );
      return updated;
    });
  };

  const isLeftColumnHiddenOnMobile =
    isMobile && (selectedService !== null || activeWizardService !== null);

  const isWizardActive = activeWizardService !== null;
  const hideSidebar = isMobile || (isWizardActive && width < 1024);
  const hideCategories =
    (isWizardActive && isDetailsExpanded) ||
    (isWizardActive && width < 1024) ||
    isLeftColumnHiddenOnMobile;

  const userProfile = useMemo(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      return {
        name:
          clerkUser.fullName ||
          clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ||
          "Client User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      };
    }
    return null;
  }, [clerkUser]);

  const handleSignOut = async () => {
    await signOut();
  };

  const activeCategory = useMemo(() => {
    if (selectedCategoryId === null || !backendCategories) return null;
    const category = backendCategories.find((c: any) => c.id === selectedCategoryId);
    if (!category) return null;

    const servicesList = backendServices ? backendServices.map((bs: any) => {
      return {
        id: bs.id,
        serviceCategoryId: category.id,
        category: category.name,
        title: bs.name,
        description: bs.description || bs.name,
        requirements: bs.requirements?.map((r: any) => r.name) || [
          "Duly accomplished Application Form",
          "Valid Government-issued ID",
          "Proof of payment of fees"
        ],
        fee: bs.feeDescription || "Varies",
        time: bs.estimatedDuration || "3-5 Working Days"
      };
    }) : [];

    const code = category.code?.toUpperCase();
    const icon = code === "EXAM" ? "award"
               : code === "CERT" ? "file-text"
               : code === "LIC" ? "shield"
               : code === "PRM" ? "key"
               : code === "ACCR" ? "activity"
               : "help-circle";

    return {
      id: category.id,
      title: category.name,
      icon: icon as any,
      description: category.description || `NTC ${category.name} services.`,
      services: servicesList
    };
  }, [selectedCategoryId, backendCategories, backendServices]);

  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "" || !allBackendServices) return null;
    const query = searchQuery.toLowerCase();
    const results: { categoryTitle: string; service: NTCService }[] = [];

    allBackendServices.forEach((bs: any) => {
      if (
        bs.name.toLowerCase().includes(query) ||
        (bs.description && bs.description.toLowerCase().includes(query))
      ) {
        const cat = backendCategories?.find((c: any) => c.id === bs.serviceCategoryId);
        results.push({
          categoryTitle: cat?.name || "Services",
          service: {
            id: bs.id,
            serviceCategoryId: bs.serviceCategoryId,
            category: cat?.name || "Services",
            title: bs.name,
            description: bs.description || bs.name,
            requirements: bs.requirements?.map((r: any) => r.name) || [
              "Duly accomplished Application Form",
              "Valid Government-issued ID",
              "Proof of payment of fees"
            ],
            fee: bs.feeDescription || "Varies",
            time: bs.estimatedDuration || "3-5 Working Days"
          }
        });
      }
    });
    return results;
  }, [searchQuery, allBackendServices, backendCategories]);

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedService(null);
    setServiceId(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    if (isMobile && selectedCategoryId === "search-active") {
      setSelectedCategoryId(null);
      setServiceId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setSelectedService(null);
    setServiceId(null);
  };

  const hasUnsavedChanges = () => {
    if (activeWizardService === null) return false;

    // Check if the wizard is on the success/completed screen
    if (activeWizardService === "cpe-accreditation" && wizardStep >= 8) return false;
    if (activeWizardService === "radio-operator-exam" && examWizardStep >= 7) return false;
    if (activeWizardService === "general-service" && wizardStep >= 6) return false;

    // Check if CPE Accreditation has actual changes
    if (activeWizardService === "cpe-accreditation") {
      if (wizardStep <= 2) return false;
      const app = applicants[0];
      if (!app) return false;
      return (
        applicants.length > 1 ||
        app.businessName.trim() !== "" ||
        app.dtiNo.trim() !== "" ||
        app.engineerName.trim() !== "" ||
        app.technicianName.trim() !== ""
      );
    }

    // Check if Radio Operator Exam has actual changes
    if (activeWizardService === "radio-operator-exam") {
      if (examWizardStep <= 2) return false;
      const app = examApplicants[0];
      if (!app) return false;
      return (
        examApplicants.length > 1 ||
        app.lastName.trim() !== "" ||
        app.firstName.trim() !== "" ||
        app.email.trim() !== ""
      );
    }

    // Check if General Service has actual changes
    if (activeWizardService === "general-service") {
      if (wizardStep <= 3) return false;
      const app = generalApplicants[0];
      if (!app) return false;
      return (
        generalApplicants.length > 1 ||
        app.firstName.trim() !== "" ||
        app.lastName.trim() !== "" ||
        app.email.trim() !== ""
      );
    }

    return false;
  };

  const confirmSwitchService = (onConfirm: () => void) => {
    if (hasUnsavedChanges()) {
      setPendingConfirmAction(() => onConfirm);
      setConfirmModalVisible(true);
    } else {
      onConfirm();
    }
  };

  const handleFormSubmit = async (formData: {
    applicantName: string;
    email: string;
    notes: string;
  }) => {
    if (selectedService === null) return;
    setSubmitting(true);
    try {
      await api.post(
        "/api/v2/applications",
        {
          title: selectedService.title,
          applicantName: formData.applicantName,
          email: formData.email,
          notes: formData.notes,
        }
      );
      setIsModalOpen(false);
      Alert.alert(
        "Success",
        "Your application has been submitted successfully.",
      );
    } catch (err: unknown) {
      console.error(err);
      let errMsg = "Failed to submit application.";
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        if (
          responseData &&
          typeof responseData === "object" &&
          "message" in responseData
        ) {
          errMsg = String(responseData.message);
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      Alert.alert("Error", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isMobile,
    width,
    navigation,
    searchQuery,
    setSearchQuery,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedService,
    setSelectedService,
    serviceId,
    setServiceId,
    backendCategories,
    allBackendServices,
    isModalOpen,
    setIsModalOpen,
    submitting,
    activeWizardService,
    setActiveWizardService,
    isDetailsExpanded,
    setIsDetailsExpanded,
    wizardStep,
    setWizardStep,
    selectedRegionId,
    setSelectedRegionId,
    selectedOfficeId,
    setSelectedOfficeId,
    appMode,
    setAppMode,
    confirmModalVisible,
    setConfirmModalVisible,
    pendingConfirmAction,
    setPendingConfirmAction,
    bulkMethod,
    setBulkMethod,
    isFileUploaded,
    setIsFileUploaded,
    uploadedFileName,
    setUploadedFileName,
    applicants,
    setApplicants,
    currentApplicantIndex,
    setCurrentApplicantIndex,
    examWizardStep,
    setExamWizardStep,
    examApplicants,
    setExamApplicants,
    currentExamApplicantIndex,
    setCurrentExamApplicantIndex,
    isBulkSubmitOpen,
    setIsBulkSubmitOpen,
    generalApplicants,
    setGeneralApplicants,
    currentGeneralApplicantIndex,
    setCurrentGeneralApplicantIndex,
    drafts,
    setDrafts,
    viewingDraftsCategory,
    setViewingDraftsCategory,
    resetWizardState,
    saveActiveAsDraft,
    loadDraft,
    handleAddGeneralApplicant,
    handleRemoveGeneralApplicant,
    handleAddExamApplicant,
    handleRemoveExamApplicant,
    handleRemoveApplicant,
    isLeftColumnHiddenOnMobile,
    isWizardActive,
    hideSidebar,
    hideCategories,
    userProfile,
    handleSignOut,
    activeCategory,
    searchResults,
    handleBackToCategories,
    handleBackToServices,
    handleClearSearch,
    confirmSwitchService,
    handleFormSubmit,
  };
}

export type ServicesState = ReturnType<typeof useServices>;
