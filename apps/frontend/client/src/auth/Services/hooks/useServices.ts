import { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { Alert, useWindowDimensions, Platform, BackHandler } from "react-native";
import { useAppNavigation } from "../../../navigation";
import { useUser, useAuth } from "@clerk/expo";
import { useApi } from "../../../shared/hooks/useApi";
import { useToast, extractApiErrorMessage } from "../../../shared/components/Toast";
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
  const toast = useToast();

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

  // Backend Service Informations Query (Paginated API)
  const { data: serviceInfosApiResponse } = api.useQuery<{ succeeded: boolean; data: any[]; totalCount: number }>("/api/v2/service-informations?pageSize=9999");
  const backendServiceInfos = serviceInfosApiResponse?.data ?? [];

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
  const [triggerOpenApplicant, setTriggerOpenApplicant] = useState(0);
  const [triggerBulkSubmit, setTriggerBulkSubmit] = useState(0);
  const [variantRequirements, setVariantRequirements] = useState<string[]>([]);

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
    setIsBulkSubmitOpen(false);
    setServiceId(null);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem("edge_active_wizard_session");
      }
      const params = new URLSearchParams(window.location.search);
      params.delete("step");
      params.delete("wizard");
      params.delete("serviceId");
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  };

  // Restore wizard & form entries from URL / sessionStorage on page reload / refresh
  const isHydrated = useRef(false);

  useEffect(() => {
    if (isHydrated.current) return;
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const urlServiceId = params.get("serviceId");
    const urlWizard = params.get("wizard");
    const urlStep = params.get("step");

    if (urlServiceId || urlWizard || urlStep) {
      try {
        const savedRaw = window.sessionStorage.getItem("edge_active_wizard_session");
        if (savedRaw) {
          const saved = JSON.parse(savedRaw);
          if (saved.service && (saved.service.id === urlServiceId || !urlServiceId)) {
            setSelectedService(saved.service);
            if (saved.activeWizardService) setActiveWizardService(saved.activeWizardService);
            if (saved.wizardStep) setWizardStep(saved.wizardStep);
            if (saved.examWizardStep) setExamWizardStep(saved.examWizardStep);
            if (saved.selectedRegionId) setSelectedRegionId(saved.selectedRegionId);
            if (saved.selectedOfficeId) setSelectedOfficeId(saved.selectedOfficeId);
            if (saved.appMode) setAppMode(saved.appMode);
            if (saved.bulkMethod) setBulkMethod(saved.bulkMethod);
            if (Array.isArray(saved.generalApplicants) && saved.generalApplicants.length > 0) {
              setGeneralApplicants(saved.generalApplicants);
            }
            if (Array.isArray(saved.examApplicants) && saved.examApplicants.length > 0) {
              setExamApplicants(saved.examApplicants);
            }
            if (Array.isArray(saved.applicants) && saved.applicants.length > 0) {
              setApplicants(saved.applicants);
            }
            isHydrated.current = true;
            return;
          }
        }
      } catch {
        // Fallback to service list matching below
      }

      if (allBackendServices && urlServiceId) {
        const matched = allBackendServices.find((s: any) => s.id === urlServiceId);
        if (matched) {
          setSelectedService({
            id: matched.id,
            code: matched.code,
            title: matched.name || matched.title,
            description: matched.description,
            serviceCategoryId: matched.serviceCategoryId,
            requirements: matched.requirements?.map((r: any) => r.name) || [],
            fee: matched.feeDescription || undefined,
            time: matched.estimatedDuration || undefined
          });
          const wizType = urlWizard || "general-service";
          setActiveWizardService(wizType);
          const stepNum = parseInt(urlStep || "1", 10);
          if (!isNaN(stepNum) && stepNum > 0) {
            setWizardStep(stepNum);
            setExamWizardStep(stepNum);
          }
          isHydrated.current = true;
        }
      }
    }
  }, [allBackendServices]);

  // Persist current wizard form entries to sessionStorage on change
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || !window.sessionStorage) return;

    if (activeWizardService && selectedService) {
      const sessionData = {
        service: selectedService,
        activeWizardService,
        wizardStep,
        examWizardStep,
        selectedRegionId,
        selectedOfficeId,
        appMode,
        bulkMethod,
        generalApplicants,
        examApplicants,
        applicants,
      };
      try {
        window.sessionStorage.setItem("edge_active_wizard_session", JSON.stringify(sessionData));
      } catch {
        // ignore storage quota / circular errors
      }
    }
  }, [
    activeWizardService,
    selectedService,
    wizardStep,
    examWizardStep,
    selectedRegionId,
    selectedOfficeId,
    appMode,
    bulkMethod,
    generalApplicants,
    examApplicants,
    applicants,
  ]);

  // Compute active step across all wizard types
  const currentActiveStep = useMemo(() => {
    if (activeWizardService === "radio-operator-exam") return examWizardStep;
    if (activeWizardService === "cpe-accreditation" || activeWizardService === "general-service") return wizardStep;
    return 1;
  }, [activeWizardService, wizardStep, examWizardStep]);

  // Sync URL history state on Web when wizard step or service changes
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const currentServiceId = selectedService?.id || serviceId;

    if (activeWizardService && currentServiceId) {
      params.set("serviceId", currentServiceId);
      params.set("wizard", activeWizardService);
      params.set("step", String(currentActiveStep));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      if (window.location.search !== `?${params.toString()}`) {
        window.history.pushState({ serviceId: currentServiceId, wizard: activeWizardService, step: currentActiveStep }, "", newUrl);
      }
    }
  }, [activeWizardService, selectedService?.id, serviceId, currentActiveStep]);

  // Fetch dynamic variant requirements for selected service
  useEffect(() => {
    let active = true;
    const fetchRequirements = async () => {
      if (!selectedService?.id) {
        if (active) {
          setVariantRequirements([]);
        }
        return;
      }
      const effectiveVariantId = generalApplicants[0]?.selectedVariantId || "";
      if (!effectiveVariantId) {
        if (active) {
          setVariantRequirements(selectedService.requirements || []);
        }
        return;
      }
      try {
        const reqRes = await api
          .get<any>(`/api/v2/services/${selectedService.id}/requirements?variantId=${effectiveVariantId || ""}`)
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

          if (list.length === 0 && selectedService.requirements && Array.isArray(selectedService.requirements) && selectedService.requirements.length > 0) {
            list = selectedService.requirements;
          }
          setVariantRequirements(list.filter(Boolean));
        }
      } catch (err) {
        console.warn("Failed to fetch requirements in useServices:", err);
      }
    };
    fetchRequirements();
    return () => { active = false; };
  }, [selectedService?.id, generalApplicants[0]?.selectedVariantId, selectedService?.requirements]);

  // Handle Hardware Back (Android) and Browser Back (PopState) for wizard steps
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handlePopState = () => {
        if (activeWizardService !== null) {
          if (currentActiveStep > 1) {
            if (activeWizardService === "radio-operator-exam") {
              setExamWizardStep((prev) => Math.max(1, prev - 1));
            } else {
              setWizardStep((prev) => Math.max(1, prev - 1));
            }
          } else {
            setActiveWizardService(null);
            setSelectedService(null);
          }
        }
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    } else if (Platform.OS !== "web") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (activeWizardService !== null) {
          if (currentActiveStep > 1) {
            if (activeWizardService === "radio-operator-exam") {
              setExamWizardStep((prev) => Math.max(1, prev - 1));
            } else {
              setWizardStep((prev) => Math.max(1, prev - 1));
            }
            return true;
          } else {
            setActiveWizardService(null);
            setSelectedService(null);
            return true;
          }
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [activeWizardService, currentActiveStep]);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftErrorMessage, setDraftErrorMessage] = useState<string | null>(null);

  const saveActiveAsDraft = async (): Promise<boolean> => {
    if (!activeWizardService) return true;
    setDraftErrorMessage(null);
    setIsSavingDraft(true);

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
      toast.info("Draft Saved Locally", "Your draft was saved locally on your device.");
      setIsSavingDraft(false);
      return true;
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

      const isGuid = (val?: string): boolean =>
        Boolean(val && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val));

      if (activeWizardService === "cpe-accreditation") {
        mappedApplicants = applicants.map(app => ({
          firstName: "CPE Supplier",
          lastName: app.businessName || "Draft",
          email: app.email || "draft@example.com",
          contactNumber: app.contactNo || "",
          address: `${app.unitBldgNo || ""}, ${app.street || ""}, ${app.barangay || ""}, ${app.city || ""}, ${app.province || ""}` || "N/A",
          birthDate: "1990-01-01",
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
            birthDate: app.birthYear ? `${app.birthYear}-${monthNum}-${day}` : "1990-01-01",
            formFieldValues: []
          };
        });
      } else if (activeWizardService === "general-service") {
        mappedApplicants = generalApplicants.map(app => {
          const monthNum = months[app.birthMonth] || "01";
          const day = (app.birthDay || "1").padStart(2, '0');

          const fullNameField = app.formFieldValues?.find(
            (fv) => fv.fieldId === "fd000000-0000-0000-0000-000000000001"
          )?.value || "";
          const addressField = app.formFieldValues?.find(
            (fv) => fv.fieldId === "fd000000-0000-0000-0000-000000000003"
          )?.value || "";
          const contactNoField = app.formFieldValues?.find(
            (fv) => fv.fieldId === "fd000000-0000-0000-0000-000000000004"
          )?.value || "";
          const emailField = app.formFieldValues?.find(
            (fv) => fv.fieldId === "fd000000-0000-0000-0000-000000000005"
          )?.value || "";

          const fullName = fullNameField.trim() || `${app.firstName} ${app.lastName}`.trim() || "Applicant";
          const firstName = fullName.split(" ")[0] || "Applicant";
          const lastName = fullName.split(" ").slice(1).join(" ") || "Detail";

          return {
            firstName,
            lastName,
            email: emailField.trim() || app.email || "draft@example.com",
            contactNumber: contactNoField.trim() || app.contactNo || "",
            address: addressField.trim() || app.address || "N/A",
            birthDate: app.birthYear ? `${app.birthYear}-${monthNum}-${day}` : "1990-01-01",
            formFieldValues: (app.formFieldValues || [])
              .filter(fv => isGuid(fv.fieldId))
              .map(fv => ({
                fieldId: fv.fieldId,
                value: fv.value || ""
              }))
          };
        });
      }

      const payload = {
        tenantId: selectedRegionId,
        submissionMode: appMode === "BULK" ? "Bulk" : "Single",
        serviceId: selectedService?.id && isGuid(selectedService.id) ? selectedService.id : null,
        scheduleId: null,
        fieldOfficeId: selectedOfficeId && isGuid(selectedOfficeId) ? selectedOfficeId : null,
        serviceVariantId: svId && isGuid(svId) ? svId : null,
        serviceVariantElementIds: (sveIds || []).filter(isGuid),
        isDraft: true,
        applicants: mappedApplicants,
      };

      await api.post(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
      toast.success("Draft Saved", "Draft saved to server successfully.");
      setIsSavingDraft(false);
      return true;
    } catch (err: unknown) {
      console.error("Failed to save draft to backend:", err);
      const errMsg = extractApiErrorMessage(err) || "Failed to save draft to server.";
      setDraftErrorMessage(errMsg);
      toast.error("Draft Save Failed", errMsg);
      setIsSavingDraft(false);
      return false;
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
    isMobile && (selectedCategoryId !== null || selectedService !== null || activeWizardService !== null);

  const isWizardActive = activeWizardService !== null;
  const hideSidebar = isMobile;
  const hideCategories =
    (isWizardActive && isDetailsExpanded) ||
    (isWizardActive && width < 1024) ||
    isLeftColumnHiddenOnMobile;

  // Auto-select first category on desktop if none is currently selected
  useEffect(() => {
    if (!isMobile && !selectedCategoryId && backendCategories && backendCategories.length > 0) {
      setSelectedCategoryId(backendCategories[0].id);
      setServiceId(backendCategories[0].id);
    }
  }, [isMobile, backendCategories, selectedCategoryId]);

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
    let catId = selectedCategoryId;
    if (catId === null && selectedService) {
      catId = (selectedService as any).serviceCategoryId || (selectedService as any).categoryId || null;
    }
    if (catId === null || !backendCategories) return null;
    const category = backendCategories.find((c: any) => c.id === catId || c.code?.toLowerCase() === catId?.toLowerCase());
    if (!category) return null;

    const rawServices = (backendServices && backendServices.length > 0)
      ? backendServices
      : (allBackendServices ? allBackendServices.filter((s: any) => s.serviceCategoryId === category.id) : []);

    const servicesList = rawServices.map((bs: any) => {
      const backendInfo = (backendServiceInfos || []).find(
        (x: any) => x.serviceId === bs.id ||
                    x.serviceTitle?.toLowerCase() === bs.name.toLowerCase() ||
                    bs.name.toLowerCase().includes((x.serviceTitle || "").toLowerCase()) ||
                    (x.serviceTitle || "").toLowerCase().includes(bs.name.toLowerCase())
      );

      return {
        id: bs.id,
        code: bs.code,
        serviceCategoryId: category.id,
        category: category.name,
        title: bs.name,
        description: backendInfo?.information || bs.description || bs.name,
        whoMayAvail: backendInfo?.whoMayAvail || undefined,
        requirements: bs.requirements?.map((r: any) => r.name) || [],
        fee: bs.feeDescription || undefined,
        time: bs.estimatedDuration || undefined
      };
    });

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
  }, [selectedCategoryId, selectedService, backendCategories, backendServices, allBackendServices, backendServiceInfos]);

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
        const backendInfo = (backendServiceInfos || []).find(
          (x: any) => x.serviceId === bs.id ||
                      x.serviceTitle?.toLowerCase() === bs.name.toLowerCase() ||
                      bs.name.toLowerCase().includes((x.serviceTitle || "").toLowerCase()) ||
                      (x.serviceTitle || "").toLowerCase().includes(bs.name.toLowerCase())
        );

        results.push({
          categoryTitle: cat?.name || "Services",
          service: {
            id: bs.id,
            code: bs.code,
            serviceCategoryId: bs.serviceCategoryId,
            category: cat?.name || "Services",
            title: bs.name,
            description: backendInfo?.information || bs.description || bs.name,
            whoMayAvail: backendInfo?.whoMayAvail || undefined,
            requirements: bs.requirements?.map((r: any) => r.name) || [],
            fee: bs.feeDescription || undefined,
            time: bs.estimatedDuration || undefined
          }
        });
      }
    });
    return results;
  }, [searchQuery, allBackendServices, backendCategories, backendServiceInfos]);

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
    if (activeWizardService !== null) {
      // Check if wizard is on final success screen
      const isSuccessStep =
        (activeWizardService === "cpe-accreditation" && wizardStep >= 8) ||
        (activeWizardService === "radio-operator-exam" && examWizardStep >= 7) ||
        (activeWizardService === "general-service" && wizardStep >= 6);

      if (isSuccessStep) {
        resetWizardState();
        setActiveWizardService(null);
        setSelectedService(null);
        onConfirm();
      } else {
        setPendingConfirmAction(() => () => {
          resetWizardState();
          setActiveWizardService(null);
          setSelectedService(null);
          onConfirm();
        });
        setConfirmModalVisible(true);
      }
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
      toast.success(
        "Application Submitted",
        "Your application has been submitted successfully."
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error("Submission Failed", extractApiErrorMessage(err));
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
    triggerOpenApplicant,
    setTriggerOpenApplicant,
    triggerBulkSubmit,
    setTriggerBulkSubmit,
    variantRequirements,
    drafts,
    setDrafts,
    viewingDraftsCategory,
    setViewingDraftsCategory,
    resetWizardState,
    saveActiveAsDraft,
    isSavingDraft,
    setIsSavingDraft,
    draftErrorMessage,
    setDraftErrorMessage,
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
