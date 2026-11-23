import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { useUser } from "@clerk/expo";
import {
  submitClientFeedback,
  safeAsync,
  PublicRegionalOfficeDto,
  PublicFieldOfficeDto,
  FeedbackDto,
} from "@edge/api";
import { useApi } from "../../hooks/useApi";
import {
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
  sendFeedbackSchema,
  ClientPolicyKey,
} from "../schemas/feedbackSchema";

const LAST_REGIONAL_OFFICE_STORAGE_KEY = "ntc_edge_client_preferred_tenant_id";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function extractArrayFromPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (isRecord(payload)) {
    if (Array.isArray(payload.data)) {
      return payload.data.filter(isRecord);
    }
    if (Array.isArray(payload.items)) {
      return payload.items.filter(isRecord);
    }
  }
  return [];
}

function mapRawFieldOffice(raw: Record<string, unknown>): PublicFieldOfficeDto {
  return {
    id: typeof raw.id === "string" ? raw.id : "",
    name: typeof raw.name === "string" ? raw.name : "",
    code: typeof raw.code === "string" ? raw.code : "",
    category: typeof raw.category === "string" ? raw.category : "Main",
    address: typeof raw.address === "string" ? raw.address : "",
    contactPhone: typeof raw.contactPhone === "string" ? raw.contactPhone : "",
    contactEmail: typeof raw.contactEmail === "string" ? raw.contactEmail : "",
    officeHead:
      typeof raw.officeHead === "string"
        ? raw.officeHead
        : typeof raw.officerInChargeName === "string"
        ? raw.officerInChargeName
        : "",
    allowPermitIssuance:
      typeof raw.allowPermitIssuance === "boolean"
        ? raw.allowPermitIssuance
        : true,
    allowComplaintReception:
      typeof raw.allowComplaintReception === "boolean"
        ? raw.allowComplaintReception
        : true,
    allowSpectrumInspection:
      typeof raw.allowSpectrumInspection === "boolean"
        ? raw.allowSpectrumInspection
        : true,
  };
}

function mapRawRegionalOffice(
  raw: Record<string, unknown>,
  allFieldOffices?: PublicFieldOfficeDto[],
): PublicRegionalOfficeDto {
  const id = typeof raw.id === "string" ? raw.id : "";
  const name = typeof raw.name === "string" ? raw.name : "";
  const code = typeof raw.code === "string" ? raw.code : "";
  const description =
    typeof raw.description === "string" ? raw.description : null;
  const regionId = typeof raw.regionId === "string" ? raw.regionId : "";
  const regionName =
    typeof raw.regionName === "string" && raw.regionName.trim().length > 0
      ? raw.regionName
      : name;
  const regionCode =
    typeof raw.regionCode === "string" && raw.regionCode.trim().length > 0
      ? raw.regionCode
      : code;

  const embeddedOffices = Array.isArray(raw.fieldOffices)
    ? raw.fieldOffices.filter(isRecord).map(mapRawFieldOffice)
    : [];

  const matchedOffices =
    embeddedOffices.length > 0
      ? embeddedOffices
      : (allFieldOffices ?? []).filter((fo) => {
          return fo.id.length > 0;
        });

  const mainOffice = matchedOffices[0];
  const primaryAddress =
    typeof raw.primaryAddress === "string" &&
    raw.primaryAddress.trim().length > 0
      ? raw.primaryAddress
      : mainOffice?.address || "";
  const primaryPhone =
    typeof raw.primaryPhone === "string" && raw.primaryPhone.trim().length > 0
      ? raw.primaryPhone
      : mainOffice?.contactPhone || "";
  const primaryEmail =
    typeof raw.primaryEmail === "string" && raw.primaryEmail.trim().length > 0
      ? raw.primaryEmail
      : mainOffice?.contactEmail || "";

  return {
    id,
    name,
    code,
    description,
    regionId,
    regionName,
    regionCode,
    primaryAddress,
    primaryPhone,
    primaryEmail,
    fieldOffices: matchedOffices,
  };
}

function readStoredTenantId(): string | null {
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    try {
      return window.localStorage.getItem(LAST_REGIONAL_OFFICE_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

function writeStoredTenantId(tenantId: string): void {
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    try {
      window.localStorage.setItem(LAST_REGIONAL_OFFICE_STORAGE_KEY, tenantId);
    } catch {
      // Ignore storage quota errors
    }
  }
}

export interface FieldErrors {
  tenantId?: string;
  category?: string;
  subject?: string;
  message?: string;
  rating?: string;
  senderName?: string;
  senderEmail?: string;
}

export function useClientSupportModals() {
  const api = useApi();
  const { user: clerkUser, isSignedIn } = useUser();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [activePolicyKey, setActivePolicyKey] =
    useState<ClientPolicyKey | null>(null);

  // Live Database Regional Offices State (No Mock Data)
  const [regionalOffices, setRegionalOffices] = useState<
    PublicRegionalOfficeDto[]
  >([]);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [officesError, setOfficesError] = useState("");

  // Form & Selection States
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [category, setCategory] = useState<FeedbackCategory>(
    FEEDBACK_CATEGORIES[0],
  );
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<FeedbackDto | null>(
    null,
  );

  // Fetch live Regional Offices (Tenants) and Field Offices directly from the backend database
  const fetchRegionalOfficesFromDb = useCallback(async () => {
    setIsLoadingOffices(true);
    setOfficesError("");

    // 1. Try public directory endpoint (/api/v2/tenants/public-directory)
    const [publicDirPayload, publicDirErr] = await safeAsync(
      api.get<unknown>("/api/v2/tenants/public-directory"),
    );

    if (publicDirErr === null && publicDirPayload !== null) {
      const rawItems = extractArrayFromPayload(publicDirPayload);
      if (rawItems.length > 0) {
        const mapped = rawItems
          .map((item) => mapRawRegionalOffice(item))
          .filter((item) => item.id.length > 0);
        setRegionalOffices(mapped);
        setIsLoadingOffices(false);
        return;
      }
    }

    // 2. Fallback to standard live DB Tenants + Field Offices endpoints (/api/v2/tenants?pageSize=100&isActive=true)
    const [tenantsPayload, tenantsErr] = await safeAsync(
      api.get<unknown>("/api/v2/tenants?pageNumber=1&pageSize=100&isActive=true"),
    );

    if (tenantsErr !== null || tenantsPayload === null) {
      setRegionalOffices([]);
      setOfficesError(
        tenantsErr ??
          publicDirErr ??
          "Unable to load NTC Regional Offices from the server.",
      );
      setIsLoadingOffices(false);
      return;
    }

    const rawTenants = extractArrayFromPayload(tenantsPayload);

    // Also fetch active field offices from the database so Help Center & Feedback display real DB addresses/contacts
    const [fieldOfficesPayload] = await safeAsync(
      api.get<unknown>("/api/v2/field-offices?isActive=true"),
    );
    const rawFieldOffices =
      fieldOfficesPayload !== null
        ? extractArrayFromPayload(fieldOfficesPayload)
        : [];

    const officesByTenant = new Map<string, PublicFieldOfficeDto[]>();
    for (const rawFo of rawFieldOffices) {
      const tenantId =
        typeof rawFo.tenantId === "string" ? rawFo.tenantId : "";
      if (tenantId.length > 0) {
        const current = officesByTenant.get(tenantId) ?? [];
        current.push(mapRawFieldOffice(rawFo));
        officesByTenant.set(tenantId, current);
      }
    }

    const mappedTenants = rawTenants
      .filter((t) => t.isActive !== false)
      .map((t) => {
        const tId = typeof t.id === "string" ? t.id : "";
        return mapRawRegionalOffice(t, officesByTenant.get(tId) ?? []);
      })
      .filter((t) => t.id.length > 0);

    setRegionalOffices(mappedTenants);
    if (mappedTenants.length === 0) {
      setOfficesError("No active NTC Regional Offices found in the database.");
    }
    setIsLoadingOffices(false);
  }, [api]);

  const shouldLoadDirectory = isFeedbackOpen || isHelpCenterOpen;
  const hasAttemptedLoadRef = useRef(false);

  useEffect(() => {
    if (!shouldLoadDirectory) {
      hasAttemptedLoadRef.current = false;
      return;
    }
    if (regionalOffices.length === 0 && !hasAttemptedLoadRef.current) {
      hasAttemptedLoadRef.current = true;
      fetchRegionalOfficesFromDb();
    }
  }, [
    shouldLoadDirectory,
    regionalOffices.length,
    fetchRegionalOfficesFromDb,
  ]);

  // If the selected office has no field offices loaded yet, fetch its field offices from DB on selection
  useEffect(() => {
    let active = true;
    async function loadFieldOfficesForSelectedTenant() {
      if (!shouldLoadDirectory || !selectedTenantId) return;
      const target = regionalOffices.find((o) => o.id === selectedTenantId);
      if (!target || target.fieldOffices.length > 0) return;

      const [foPayload, foErr] = await safeAsync(
        api.get<unknown>(
          `/api/v2/tenants/${selectedTenantId}/field-offices?isActive=true`,
        ),
      );
      if (!active || foErr !== null || foPayload === null) return;

      const rawOffices = extractArrayFromPayload(foPayload);
      if (rawOffices.length === 0) return;

      const mappedOffices = rawOffices.map(mapRawFieldOffice);
      const mainFo = mappedOffices[0];

      setRegionalOffices((prev) =>
        prev.map((office) => {
          if (office.id !== selectedTenantId) return office;
          return {
            ...office,
            primaryAddress:
              office.primaryAddress || mainFo?.address || "",
            primaryPhone:
              office.primaryPhone || mainFo?.contactPhone || "",
            primaryEmail:
              office.primaryEmail || mainFo?.contactEmail || "",
            fieldOffices: mappedOffices,
          };
        }),
      );
    }
    loadFieldOfficesForSelectedTenant();
    return () => {
      active = false;
    };
  }, [shouldLoadDirectory, selectedTenantId, regionalOffices, api]);

  // Pre-fill signed-in user's name and email
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const fullName =
        clerkUser.fullName ||
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
      const email = clerkUser.primaryEmailAddress?.emailAddress ?? "";
      if (fullName && senderName.trim().length === 0) {
        setSenderName(fullName);
      }
      if (email && senderEmail.trim().length === 0) {
        setSenderEmail(email);
      }
    }
  }, [isSignedIn, clerkUser, senderName, senderEmail]);

  // Auto-preselect last-used NTC Regional Office from actual DB results
  useEffect(() => {
    if (regionalOffices.length === 0) return;

    const currentMatches = regionalOffices.some(
      (o) => o.id === selectedTenantId,
    );
    if (currentMatches) return;

    const storedId = readStoredTenantId();
    if (storedId) {
      const storedMatch = regionalOffices.find((o) => o.id === storedId);
      if (storedMatch) {
        setSelectedTenantId(storedMatch.id);
        return;
      }
    }

    const ncrOffice =
      regionalOffices.find(
        (o) =>
          o.code.toUpperCase().includes("NCR") ||
          o.regionCode.toUpperCase().includes("NCR") ||
          o.name.toUpperCase().includes("NCR"),
      ) ?? regionalOffices[0];

    if (ncrOffice) {
      setSelectedTenantId(ncrOffice.id);
    }
  }, [regionalOffices, selectedTenantId]);

  const handleSelectTenant = useCallback((tenantId: string) => {
    setSelectedTenantId(tenantId);
    writeStoredTenantId(tenantId);
    setFieldErrors((prev) => ({ ...prev, tenantId: undefined }));
  }, []);

  const selectedOffice: PublicRegionalOfficeDto | null = useMemo(() => {
    return (
      regionalOffices.find((o) => o.id === selectedTenantId) ??
      regionalOffices[0] ??
      null
    );
  }, [regionalOffices, selectedTenantId]);

  const openFeedbackModal = useCallback(
    (preselectedTenantId?: string) => {
      if (preselectedTenantId) {
        handleSelectTenant(preselectedTenantId);
      }
      setSubmittedReceipt(null);
      setSubmitError("");
      setFieldErrors({});
      setIsHelpCenterOpen(false);
      setIsFeedbackOpen(true);
    },
    [handleSelectTenant],
  );

  const closeFeedbackModal = useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);

  const openHelpCenterModal = useCallback(
    (preselectedTenantId?: string) => {
      if (preselectedTenantId) {
        handleSelectTenant(preselectedTenantId);
      }
      setIsFeedbackOpen(false);
      setIsHelpCenterOpen(true);
    },
    [handleSelectTenant],
  );

  const closeHelpCenterModal = useCallback(() => {
    setIsHelpCenterOpen(false);
  }, []);

  const openPolicyModal = useCallback((policyKey: ClientPolicyKey) => {
    setActivePolicyKey(policyKey);
  }, []);

  const closePolicyModal = useCallback(() => {
    setActivePolicyKey(null);
  }, []);

  const resetFeedbackForm = useCallback(() => {
    setSubject("");
    setMessage("");
    setRating(5);
    setFieldErrors({});
    setSubmitError("");
    setSubmittedReceipt(null);
  }, []);

  const handleSubmitFeedback = useCallback(async () => {
    setSubmitError("");
    setFieldErrors({});

    const formattedSubject =
      subject.trim().length > 0 ? `[${category}] ${subject.trim()}` : "";

    const parsed = sendFeedbackSchema.safeParse({
      tenantId: selectedTenantId,
      category,
      subject: subject.trim(),
      message: message.trim(),
      rating,
      isAnonymous,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "tenantId" && !nextErrors.tenantId) {
          nextErrors.tenantId = issue.message;
        } else if (key === "category" && !nextErrors.category) {
          nextErrors.category = issue.message;
        } else if (key === "subject" && !nextErrors.subject) {
          nextErrors.subject = issue.message;
        } else if (key === "message" && !nextErrors.message) {
          nextErrors.message = issue.message;
        } else if (key === "rating" && !nextErrors.rating) {
          nextErrors.rating = issue.message;
        } else if (key === "senderName" && !nextErrors.senderName) {
          nextErrors.senderName = issue.message;
        } else if (key === "senderEmail" && !nextErrors.senderEmail) {
          nextErrors.senderEmail = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const [submittedData, errMessage] = await safeAsync(
      submitClientFeedback({
        tenantId: selectedTenantId,
        senderName: isAnonymous ? "Anonymous User" : senderName.trim(),
        senderEmail: isAnonymous
          ? "anonymous@hidden.local"
          : senderEmail.trim(),
        subject: formattedSubject,
        message: message.trim(),
        rating,
        isAnonymous,
      }),
    );

    setIsSubmitting(false);

    if (errMessage !== null || submittedData === null) {
      setSubmitError(
        errMessage ?? "Failed to submit feedback. Please try again.",
      );
      return;
    }

    setSubmittedReceipt({
      ...submittedData,
      tenantName:
        submittedData.tenantName ??
        selectedOffice?.name ??
        "NTC Regional Office",
    });
  }, [
    selectedTenantId,
    category,
    subject,
    message,
    rating,
    isAnonymous,
    senderName,
    senderEmail,
    selectedOffice,
  ]);

  return {
    isSignedIn: Boolean(isSignedIn),
    isFeedbackOpen,
    isHelpCenterOpen,
    activePolicyKey,
    regionalOffices,
    isLoadingOffices,
    officesError,
    refetchRegionalOffices: fetchRegionalOfficesFromDb,
    selectedTenantId,
    selectedOffice,
    handleSelectTenant,
    category,
    setCategory,
    subject,
    setSubject,
    message,
    setMessage,
    rating,
    setRating,
    isAnonymous,
    setIsAnonymous,
    senderName,
    setSenderName,
    senderEmail,
    setSenderEmail,
    fieldErrors,
    submitError,
    isSubmitting,
    submittedReceipt,
    openFeedbackModal,
    closeFeedbackModal,
    openHelpCenterModal,
    closeHelpCenterModal,
    openPolicyModal,
    closePolicyModal,
    resetFeedbackForm,
    handleSubmitFeedback,
  };
}
