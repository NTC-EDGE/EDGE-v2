import { useState, useMemo } from "react";
import axios from "axios";
import { Alert, useWindowDimensions, Platform } from "react-native";
import { useAppNavigation } from "../../../navigation";
import { useUser, useAuth } from "@clerk/expo";
import { useApi } from "../../../shared/hooks/useApi";
import { servicesData, NTCService } from "../data/servicesData";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeWizardService, setActiveWizardService] = useState<string | null>(
    null,
  );
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

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
  };

  const saveActiveAsDraft = () => {
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
    Alert.alert("Success", "Draft saved successfully.");
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
    if (selectedCategoryId === null) return null;
    const category = servicesData.find((c) => c.id === selectedCategoryId);
    return category ?? null;
  }, [selectedCategoryId]);

  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "") return null;
    const query = searchQuery.toLowerCase();
    const results: { categoryTitle: string; service: NTCService }[] = [];

    servicesData.forEach((category) => {
      category.services.forEach((service) => {
        if (
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        ) {
          results.push({ categoryTitle: category.title, service });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    if (isMobile && selectedCategoryId === "search-active") {
      setSelectedCategoryId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setSelectedService(null);
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
