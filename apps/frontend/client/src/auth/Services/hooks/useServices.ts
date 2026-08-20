import { useState, useMemo, useEffect, useRef } from "react";
import { Alert, useWindowDimensions, Platform, BackHandler } from "react-native";
import { useAppNavigation } from "../../../navigation";
import { useUser, useAuth } from "@clerk/expo";
import { useApi } from "../../../shared/hooks/useApi";
import { useToast, extractApiErrorMessage } from "../../../shared/components/Toast";
import { NTCService } from "../data/servicesData";
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
  selectedScheduleId?: string | null;
  appMode: "SINGLE" | "BULK" | "";
  bulkMethod: "MANUAL" | "EXCEL";
  isFileUploaded: boolean;
  uploadedFileName: string;
  applicants: any[];
  examApplicants: any[];
  generalApplicants: GeneralApplicantData[];
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

  // Backend Categories Query (with draft counts per category)
  const { data: categoriesApiResponse, mutate: refetchCategories } = api.useQuery<{ succeeded: boolean; data: any[] }>("/api/v2/service-categories");
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
  const [appMode, setAppMode] = useState<"SINGLE" | "BULK" | "">("SINGLE");

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

  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [viewingDraftsCategory, setViewingDraftsCategory] = useState<string | null>(null);

  // Backend Drafts Query
  const { data: draftsApiResponse, mutate: refetchDrafts, isLoading: isLoadingDrafts } = api.useQuery<{ succeeded: boolean; data: any[] }>(
    "/api/v2/applications/me/drafts"
  );
  const drafts = draftsApiResponse?.succeeded ? (draftsApiResponse.data || []) : [];

  const resetWizardState = () => {
    setActiveDraftId(null);
    setWizardStep(1);
    setExamWizardStep(1);
    setSelectedRegionId("");
    setSelectedOfficeId("");
    setAppMode("SINGLE");
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
  }, [selectedService?.id, generalApplicants[0]?.selectedVariantId]);

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

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    try {
      await api.del(`/api/v2/applications/me/drafts/${draftId}`);
      toast.success("Draft Deleted", "The draft has been permanently removed.");
      await refetchDrafts();
      await refetchCategories();
      return true;
    } catch (err: unknown) {
      toast.error("Failed to Delete Draft", extractApiErrorMessage(err));
      return false;
    }
  };

  const removeActiveDraftOnSubmit = async () => {
    if (activeDraftId) {
      setActiveDraftId(null);
      await refetchDrafts();
      await refetchCategories();
    }
  };

  const saveActiveAsDraft = async (): Promise<boolean> => {
    if (!activeWizardService) return true;
    setDraftErrorMessage(null);
    setIsSavingDraft(true);

    const isGuid = (val?: string): boolean =>
      Boolean(val && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val));

    const effectiveTenantId = isGuid(selectedRegionId)
      ? selectedRegionId
      : (backendCategories?.[0]?.id || "00000000-0000-0000-0000-000000000001");

    try {
      const months: Record<string, string> = {
        January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
        July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
      };

      let mappedApplicants: Array<{
        serviceId?: string | null;
        serviceVariantId?: string | null;
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
          serviceId: selectedService?.id && isGuid(selectedService.id) ? selectedService.id : null,
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
            serviceId: selectedService?.id && isGuid(selectedService.id) ? selectedService.id : null,
            serviceVariantId: app.selectedVariantId && isGuid(app.selectedVariantId) ? app.selectedVariantId : (svId && isGuid(svId) ? svId : null),
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
        const activeApp = generalApplicants[currentGeneralApplicantIndex];
        if (activeApp) {
          svId = activeApp.selectedVariantId || null;
          sveIds = activeApp.selectedElementId ? [activeApp.selectedElementId] : [];
        }
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
            serviceId: selectedService?.id && isGuid(selectedService.id) ? selectedService.id : null,
            serviceVariantId: app.selectedVariantId && isGuid(app.selectedVariantId) ? app.selectedVariantId : (svId && isGuid(svId) ? svId : null),
            firstName,
            lastName,
            email: emailField.trim() || app.email || "draft@example.com",
            contactNumber: contactNoField.trim() || app.contactNo || "",
            address: addressField.trim() || app.address || "N/A",
            birthDate: app.birthYear ? `${app.birthYear}-${monthNum}-${day}` : "1990-01-01",
            formFieldValues: Array.from(
              (app.formFieldValues || []).reduce((map, fv) => {
                if (isGuid(fv.fieldId)) {
                  map.set(fv.fieldId, fv.value || "");
                }
                return map;
              }, new Map<string, string>()).entries()
            ).map(([fieldId, value]) => ({ fieldId, value }))
          };
        });
      }

      const payload = {
        tenantId: effectiveTenantId,
        submissionMode: appMode === "BULK" ? "Bulk" : "Single",
        serviceId: selectedService?.id && isGuid(selectedService.id) ? selectedService.id : null,
        scheduleId: null,
        fieldOfficeId: selectedOfficeId && isGuid(selectedOfficeId) ? selectedOfficeId : null,
        serviceVariantId: svId && isGuid(svId) ? svId : null,
        serviceVariantElementIds: (sveIds || []).filter(isGuid),
        isDraft: true,
        existingDraftId: activeDraftId && isGuid(activeDraftId) ? activeDraftId : null,
        applicants: mappedApplicants,
      };

      const res = await api.post<{ succeeded: boolean; data: string }>(`/api/v2/applications`, payload);
      if (res?.data) {
        setActiveDraftId(res.data);
      }
      toast.success("Draft Saved", "Your application draft has been saved to the server.");
      await refetchDrafts();
      await refetchCategories();
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

  const loadDraft = async (draft: any) => {
    // Close the drafts modal immediately to avoid native modal collision
    setViewingDraftsCategory(null);

    let fullDraft = draft;
    if (!draft.applicants || draft.applicants.length === 0) {
      try {
        const fullRes = await api.get<{ succeeded: boolean; data: any }>(`/api/v2/applications/${draft.id}`);
        if (fullRes?.succeeded && fullRes.data) {
          fullDraft = fullRes.data;
        } else {
          toast.error("Failed to Load Draft", "Could not retrieve full draft details from the server.");
        }
      } catch (err) {
        console.warn("Failed to fetch full application details for draft:", err);
        toast.error("Failed to Load Draft", extractApiErrorMessage(err) || "Network error loading draft details.");
      }
    }

    // Slightly delay the confirmation dialog to allow drafts modal to finish transition
    setTimeout(() => {
      confirmSwitchService(() => {
        setActiveDraftId(fullDraft.id);

        const draftServiceId = fullDraft.serviceId || fullDraft.applicants?.[0]?.serviceId;
        const matchedService = allBackendServices?.find((s: any) => s.id === draftServiceId) || null;
        setSelectedService(matchedService);
        if (draftServiceId) {
          setServiceId(draftServiceId);
        }

        const draftCategoryId = fullDraft.serviceCategoryId || matchedService?.serviceCategoryId;
        if (draftCategoryId) {
          setSelectedCategoryId(draftCategoryId);
        }

        setSelectedRegionId(fullDraft.tenantId || fullDraft.regionId || "");
        setSelectedOfficeId(fullDraft.office || "");
        setAppMode(fullDraft.submissionMode?.toUpperCase() === "BULK" ? "BULK" : "SINGLE");
        setBulkMethod("MANUAL");
        setIsFileUploaded(false);
        setUploadedFileName("");
        setCurrentApplicantIndex(0);
        setCurrentExamApplicantIndex(0);
        setCurrentGeneralApplicantIndex(0);

        const categoryCode = fullDraft.serviceCategoryCode?.toUpperCase() || matchedService?.categoryCode?.toUpperCase() || "";
        const serviceName = (fullDraft.serviceName || matchedService?.title || "").toLowerCase();

        let wizType = "general-service";
        if (categoryCode === "EXAM" || serviceName.includes("radio operator") || serviceName.includes("exam")) {
          wizType = "radio-operator-exam";
        } else if (serviceName.includes("cpe") || serviceName.includes("customer premise")) {
          wizType = "cpe-accreditation";
        }
        setActiveWizardService(wizType);

        if (fullDraft.applicants && fullDraft.applicants.length > 0) {
          if (wizType === "radio-operator-exam") {
            const mappedExamApps = fullDraft.applicants.map((a: any, idx: number) => {
              const d = a.details || {};
              const birthParts = (d.birthDate || "").split("-");
              const fvList = a.formFieldValues || [];
              const elementFv = fvList.find((fv: any) =>
                fv.fieldLabel?.toLowerCase().includes("element") ||
                fv.fieldLabel?.toLowerCase().includes("class option")
              );

              return {
                id: idx + 1,
                firstName: d.firstName || "",
                lastName: d.lastName || "",
                middleName: d.middleName || "",
                suffix: d.suffix || "",
                email: d.emailAddress || a.email || "",
                contactNo: d.contactNumber || a.contactNumber || "",
                street: d.address || "",
                barangay: "",
                city: "",
                province: "",
                birthYear: birthParts[0] || "",
                birthMonth: birthParts[1] ? ["January","February","March","April","May","June","July","August","September","October","November","December"][parseInt(birthParts[1], 10) - 1] || "" : "",
                birthDay: birthParts[2] ? String(parseInt(birthParts[2], 10)) : "",
                selectedVariantId: a.serviceVariantId || "",
                selectedElementId: elementFv?.value || "",
                uploads: {},
                files: {},
              };
            });
            setExamApplicants(mappedExamApps);
          } else if (wizType === "cpe-accreditation") {
            const mappedCpeApps = fullDraft.applicants.map((a: any, idx: number) => {
              const d = a.details || {};
              return {
                id: idx + 1,
                appType: "NEW" as const,
                years: "1",
                variation: "",
                accreditationNo: "",
                businessName: d.lastName || "",
                entityType: "",
                dtiNo: "",
                regionName: "",
                province: "",
                city: "",
                barangay: "",
                street: d.address || "",
                zone: "",
                unitBldgNo: "",
                zipCode: d.zipCode || "",
                contactNo: d.contactNumber || a.contactNumber || "",
                email: d.emailAddress || a.email || "",
                engineerName: "",
                eceNo: "",
                technicianName: "",
                ectNo: "",
                expiryMonth: "",
                expiryYear: "",
                uploads: {},
                files: {},
              };
            });
            setApplicants(mappedCpeApps);
          } else {
            const mappedGeneralApps = fullDraft.applicants.map((a: any, idx: number) => {
              const d = a.details || {};
              const birthParts = (d.birthDate || "").split("-");
              return {
                id: idx + 1,
                firstName: d.firstName || "",
                lastName: d.lastName || "",
                middleName: d.middleName || "",
                suffix: d.suffix || "",
                email: d.emailAddress || a.email || "",
                contactNo: d.contactNumber || a.contactNumber || "",
                address: d.address || "",
                birthYear: birthParts[0] || "",
                birthMonth: birthParts[1] ? ["January","February","March","April","May","June","July","August","September","October","November","December"][parseInt(birthParts[1], 10) - 1] || "" : "",
                birthDay: birthParts[2] ? String(parseInt(birthParts[2], 10)) : "",
                notes: "",
                selectedVariantId: a.serviceVariantId || "",
                formFieldValues: (a.formFieldValues || []).map((fv: any) => ({
                  fieldId: fv.fieldId,
                  fieldLabel: fv.fieldLabel,
                  value: fv.value || "",
                })),
                uploads: {},
                files: {},
              };
            });
            setGeneralApplicants(mappedGeneralApps);
          }
        }

        const targetStep = 3;
        setWizardStep(targetStep);
        setExamWizardStep(targetStep);
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
      setCurrentGeneralApplicantIndex(0);
      return updated;
    });
  };

  const handleRemoveMultipleGeneralApplicants = (indices: number[]) => {
    const toDeleteSet = new Set(indices);
    setGeneralApplicants((prev) => {
      const updated = prev.filter((_, i) => !toDeleteSet.has(i));
      setCurrentGeneralApplicantIndex(0);
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
      setCurrentExamApplicantIndex(0);
      return updated;
    });
  };

  const handleRemoveMultipleExamApplicants = (indices: number[]) => {
    const toDeleteSet = new Set(indices);
    setExamApplicants((prev) => {
      const updated = prev.filter((_, i) => !toDeleteSet.has(i));
      setCurrentExamApplicantIndex(0);
      return updated;
    });
  };

  const handleRemoveApplicant = (idx: number) => {
    setApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setCurrentApplicantIndex(0);
      return updated;
    });
  };

  const handleRemoveMultipleApplicants = (indices: number[]) => {
    const toDeleteSet = new Set(indices);
    setApplicants((prev) => {
      const updated = prev.filter((_, i) => !toDeleteSet.has(i));
      setCurrentApplicantIndex(0);
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
  const hasAutoSelectedCategory = useRef(false);
  useEffect(() => {
    if (hasAutoSelectedCategory.current) return;
    if (!isMobile && !selectedCategoryId && backendCategories && backendCategories.length > 0) {
      hasAutoSelectedCategory.current = true;
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
      removeActiveDraftOnSubmit();
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
    activeDraftId,
    removeActiveDraftOnSubmit,
    viewingDraftsCategory,
    setViewingDraftsCategory,
    resetWizardState,
    saveActiveAsDraft,
    deleteDraft,
    isSavingDraft,
    setIsSavingDraft,
    draftErrorMessage,
    setDraftErrorMessage,
    loadDraft,
    handleAddGeneralApplicant,
    handleRemoveGeneralApplicant,
    handleRemoveMultipleGeneralApplicants,
    handleAddExamApplicant,
    handleRemoveExamApplicant,
    handleRemoveMultipleExamApplicants,
    handleRemoveApplicant,
    handleRemoveMultipleApplicants,
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
