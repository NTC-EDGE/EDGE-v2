import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
  useTheme,
  toast,
  DatePickerInput,
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationStatus,
  ApplicationCategory,
} from "../../../types/application";
import { ActivityCard } from "./ActivityCard";
import { useAdminApplications, applicationService, mutateApplications, useTenantConfig } from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import {
  usePermissions,
  QueueTab,
} from "../../shell/context/PermissionContext";
import { useRole } from "../../shell/context/RoleContext";
import { useAuthContext } from "../../auth/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOrder = "newest" | "oldest";

type FilterStatus =
  | Extract<
      ApplicationStatus,
      "Approved" | "Returned" | "Completed" | "ForIssuance" | "PendingPayment"
    >
  | "ForAssessment";

type FilterMode = "SINGLE" | "BULK";

// ─── Static config ───────────────────────────────────────────────────────────

const FILTER_MODES: {
  label: string;
  value: FilterMode;
  icon: "user" | "users";
}[] = [
  { label: "Single Application", value: "SINGLE", icon: "user" },
  { label: "Bulk Application",   value: "BULK",   icon: "users" },
];

const FILTER_STATUSES: {
  label: string;
  value: FilterStatus;
  icon: "check-circle" | "x-circle" | "calendar" | "award" | "credit-card" | "file-text";
}[] = [
  { label: "For Assessment",      value: "ForAssessment",  icon: "file-text" },
  { label: "For Payment", value: "PendingPayment", icon: "credit-card" },
  { label: "Approved",            value: "Approved",       icon: "check-circle" },
  { label: "Returned",            value: "Returned",       icon: "x-circle" },
  { label: "Completed",           value: "Completed",      icon: "calendar" },
  { label: "For Issuance",        value: "ForIssuance",    icon: "award" },
];

const FILTER_CATEGORIES: {
  label: string;
  value: ApplicationCategory;
  icon: "book-open" | "file" | "award" | "star" | "message-circle";
}[] = [
  { label: "Exams",                  value: "Exams",                  icon: "book-open" },
  { label: "Permits",                value: "Permits",                icon: "file" },
  { label: "Licenses",               value: "Licenses",               icon: "award" },
  { label: "Accreditations",         value: "Accreditations",         icon: "star" },
  { label: "Certificates",           value: "Certificates",           icon: "award" },
  { label: "Complaints and Request", value: "Complaints and Request", icon: "message-circle" },
];

const TAB_LABELS: { key: QueueTab; label: string }[] = [
  { key: "activity", label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "history",  label: "Processed" },
  { key: "issuance", label: "For Issuance" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface DateGroup {
  label: string;
  dateKey: string;
  items: ApplicationData[];
}

function buildDateGroups(
  apps: ApplicationData[],
  sortOrder: SortOrder,
): DateGroup[] {
  const pinnedItems = apps.filter((a) => Boolean(a.isPinned));
  const unpinnedApps = apps.filter((a) => !a.isPinned);

  const groupMap = new Map<
    string,
    { label: string; items: ApplicationData[]; ts: number }
  >();

  for (const app of unpinnedApps) {
    const dateStr = app.createdAt;
    const date = new Date(dateStr);
    const dateKey = date.toISOString().slice(0, 10);
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, { label: app.dateLabel, items: [], ts: date.getTime() });
    }
    const group = groupMap.get(dateKey);
    if (group !== undefined) {
      group.items.push(app);
    }
  }

  const sorted = Array.from(groupMap.entries()).sort(([, a], [, b]) =>
    sortOrder === "newest" ? b.ts - a.ts : a.ts - b.ts,
  );

  const result: DateGroup[] = [];

  if (pinnedItems.length > 0) {
    result.push({
      label: "PINNED TO TOP",
      dateKey: "pinned",
      items: [...pinnedItems].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
      }),
    });
  }

  for (const [dateKey, { label, items }] of sorted) {
    result.push({
      label,
      dateKey,
      items: [...items].sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
      }),
    });
  }

  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface ActivitiesFeedPaneProps {
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  activeQueueTab?: QueueTab;
  onSelectQueueTab?: (tab: QueueTab) => void;
}

export function ActivitiesFeedPane({
  selectedId,
  onSelectId: setSelectedId,
  activeQueueTab = "activity",
  onSelectQueueTab: setActiveQueueTab,
}: ActivitiesFeedPaneProps) {
  const { visibleTabs } = usePermissions();
  const { colors, isDark } = useTheme();
  const { user } = useAuthContext();
  const { currentRole } = useRole();
  const isAdmin = currentRole === "Admin";
  const officerName = user?.name || user?.email || "Evaluating Officer";
  const { config: tenantConfig } = useTenantConfig();

  const PAGE_SIZE_STEP = 15;
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { applications: rawDtos, pagination, isLoading, refetch } = useAdminApplications({
    queueTab: activeQueueTab,
    role: currentRole,
    assignedTo: officerName,
    scope: "queue",
    pageSize,
    pageNumber: 1,
    searchTerm: debouncedSearchQuery.length > 0 ? debouncedSearchQuery : undefined,
  }, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const applications = useMemo(() => {
    if (!Array.isArray(rawDtos)) return [];
    return rawDtos.map((dto) => mapApplicationDtoToUI(dto, currentRole));
  }, [rawDtos, currentRole]);

  useEffect(() => {
    setPageSize(PAGE_SIZE_STEP);
  }, [activeQueueTab]);

  useEffect(() => {
    if (!isLoading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    setIsLoadingMore(true);
    setPageSize((prev) => prev + PAGE_SIZE_STEP);
  }, [isLoading, isLoadingMore]);

  const totalAvailable = pagination?.totalCount ?? applications.length;
  const hasMore = pagination
    ? Boolean(pagination.hasNextPage) || applications.length < totalAvailable
    : applications.length >= pageSize;

  const togglePinApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    const nextPinned = app?.isPinned !== true;

    // 1. Optimistic update in SWR cache for immediate UI re-sorting
    await refetch(
      (currentData) => {
        if (!currentData || !currentData.data) return currentData;
        const payload = currentData.data;
        if (Array.isArray(payload)) {
          const updated = payload.map((item) => (item.id === id ? { ...item, isPinned: nextPinned } : item));
          return { ...currentData, data: updated };
        }
        if (Array.isArray(payload.items)) {
          const updatedItems = payload.items.map((item) => (item.id === id ? { ...item, isPinned: nextPinned } : item));
          return { ...currentData, data: { ...payload, items: updatedItems } };
        }
        return currentData;
      },
      { revalidate: false }
    );

    const [res, err] = await applicationService.togglePin(id, nextPinned);
    if (err !== null) {
      toast.error("Failed to pin/unpin application.");
      await refetch();
      return;
    }
    toast.success(nextPinned ? "Application pinned to top." : "Application unpinned.");
    await mutateApplications(id);
    await refetch();
  }, [applications, refetch]);

  const toggleArchiveApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    const nextArchived = app?.isArchived !== true;

    // 1. Optimistic update in SWR cache
    await refetch(
      (currentData) => {
        if (!currentData || !currentData.data) return currentData;
        const payload = currentData.data;
        if (Array.isArray(payload)) {
          const updated = payload.map((item) => (item.id === id ? { ...item, isArchived: nextArchived } : item));
          return { ...currentData, data: updated };
        }
        if (Array.isArray(payload.items)) {
          const updatedItems = payload.items.map((item) => (item.id === id ? { ...item, isArchived: nextArchived } : item));
          return { ...currentData, data: { ...payload, items: updatedItems } };
        }
        return currentData;
      },
      { revalidate: false }
    );

    const [res, err] = await applicationService.toggleArchive(id, nextArchived);
    if (err !== null) {
      toast.error("Failed to archive/unarchive application.");
      await refetch();
      return;
    }
    if (selectedId === id) setSelectedId?.(null);
    toast.success(nextArchived ? "Application archived." : "Application unarchived.");
    await mutateApplications(id);
    await refetch();
  }, [applications, selectedId, setSelectedId, refetch]);

  const evaluateApplication = useCallback(async (id: string) => {
    const [res, err] = await applicationService.updateStatus(id, {
      status: "Evaluating",
      action: `Evaluation Started by ${officerName}`,
      staffName: officerName,
      staffRole: "Evaluating Officer",
      remarks: `Technical evaluation started by ${officerName}.`,
    });
    if (err !== null) {
      toast.error("Failed to start evaluation.");
      return;
    }
    toast.success(`Evaluation started by ${officerName}.`);
    await mutateApplications(id);
    await refetch();
  }, [officerName, refetch]);

  const releaseEvaluation = useCallback(async (id: string) => {
    const [res, err] = await applicationService.updateStatus(id, {
      status: "Submitted",
      action: `Evaluation Released / Returned to Queue by ${officerName}`,
      staffName: officerName,
      staffRole: "Evaluating Officer",
      remarks: `Evaluation released back to queue by ${officerName}.`,
    });
    if (err !== null) {
      toast.error("Failed to release evaluation.");
      return;
    }
    toast.success("Evaluation released back to queue.");
    await mutateApplications(id);
    await refetch();
  }, [officerName, refetch]);

  const resetStore = useCallback(() => {
    setPageSize(PAGE_SIZE_STEP);
    refetch();
  }, [refetch]);

  const [sortOrder,         setSortOrder]         = useState<SortOrder>("newest");
  const [activeStatuses,    setActiveStatuses]    = useState<Set<string>>(new Set());
  const [activeCategories,  setActiveCategories]  = useState<Set<ApplicationCategory>>(new Set());
  const [activeModes,       setActiveModes]       = useState<Set<FilterMode>>(new Set());
  const [dateFrom,          setDateFrom]          = useState("");
  const [dateTo,            setDateTo]            = useState("");
  const [showSortDropdown,  setShowSortDropdown]  = useState(false);
  const [showDatePicker,    setShowDatePicker]    = useState(false);
  const [showFilterPanel,   setShowFilterPanel]   = useState(false);
  const [collapsedGroups,   setCollapsedGroups]   = useState<Set<string>>(new Set());

  // ── Derived theme colors ────────────────────────────────────────────────────
  const bg          = isDark ? colors.neutral[900] : colors.neutral[50];
  const surface     = isDark ? colors.neutral[800] : COLORS.neutral.white;
  const border      = isDark ? colors.neutral[700] : colors.neutral[200];
  const borderSoft  = isDark ? colors.neutral[800] : colors.neutral[100];
  const text        = isDark ? colors.neutral[100] : colors.neutral[900];
  const textSub     = isDark ? colors.neutral[400] : colors.neutral[600];
  const textMuted   = isDark ? colors.neutral[500] : colors.neutral[500];
  const brandColor  = isDark ? colors.brand[500]   : colors.brand[700];
  const brandBg     = isDark ? colors.neutral[800] : COLORS.brand[50] ?? '#EFF6FF';
  const inputBg     = isDark ? colors.neutral[900] : COLORS.neutral.white;
  const toolBg      = isDark ? colors.neutral[700] : colors.neutral[100];

  // ── Callbacks ───────────────────────────────────────────────────────────────
  const toggleStatus = useCallback((status: string) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((cat: ApplicationCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }, []);

  const toggleMode = useCallback((mode: FilterMode) => {
    setActiveModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode); else next.add(mode);
      return next;
    });
  }, []);

  const toggleGroupCollapse = useCallback((dateKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey); else next.add(dateKey);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSortOrder("newest");
    setActiveStatuses(new Set());
    setActiveCategories(new Set());
    setActiveModes(new Set());
    setDateFrom("");
    setDateTo("");
    setShowSortDropdown(false);
    setShowDatePicker(false);
    setShowFilterPanel(false);
    resetStore();
  }, [resetStore]);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = applications.filter((app) => {
      if (app.status === "Draft" || app.isArchived) return false;
      if (activeQueueTab === "issuance") {
        if (app.status !== "ForIssuance" && app.queueTab !== "issuance") return false;
      } else if (activeQueueTab !== "activity" && app.queueTab !== activeQueueTab) {
        return false;
      }

      // Legal & Evaluator role separation for statutory complaints vs commercial applications
      if (activeQueueTab === "pending") {
        const complaintRouting = tenantConfig.requestAndComplaintRouting ?? "DirectToLegal";
        if (complaintRouting === "DirectToLegal") {
          if (currentRole === "Legal") {
            // Legal Officer pending queue focuses exclusively on Complaints & Requests
            if (app.category !== "Complaints and Request") return false;
          } else if (currentRole === "Evaluator") {
            // Regional Evaluator pending queue focuses on commercial spectrum/permits; complaints are routed directly to Legal
            if (app.category === "Complaints and Request") return false;
          }
        } else {
          // DirectToEvaluator:
          // Regional Evaluators receive complaints directly to evaluate and endorse to Legal
          // Legal Officers see complaints once endorsed or assigned to Legal
          if (currentRole === "Legal") {
            const isAssignedOrEndorsedToLegal =
              (app.assignedTo !== null && app.assignedTo !== undefined && app.assignedTo.toLowerCase().includes("legal")) ||
              (app.endorsedTo !== null && app.endorsedTo !== undefined && app.endorsedTo.toLowerCase().includes("legal"));
            if (app.category !== "Complaints and Request" || !isAssignedOrEndorsedToLegal) return false;
          }
        }
      }
      if (q.length > 0) {
        // 1. Applicant Name & Details
        const matchesApplicant =
          (typeof app.applicant === "string" && app.applicant.toLowerCase().includes(q)) ||
          (typeof app.basicInfo?.firstName === "string" && app.basicInfo.firstName.toLowerCase().includes(q)) ||
          (typeof app.basicInfo?.lastName === "string" && app.basicInfo.lastName.toLowerCase().includes(q)) ||
          (typeof app.companyDetails?.name === "string" && app.companyDetails.name.toLowerCase().includes(q)) ||
          (typeof app.filingUser?.name === "string" && app.filingUser.name.toLowerCase().includes(q)) ||
          (Array.isArray(app.applicantsList) &&
            app.applicantsList.some(
              (a) =>
                (typeof a.name === "string" && a.name.toLowerCase().includes(q)) ||
                (typeof a.email === "string" && a.email.toLowerCase().includes(q))
            ));

        // 2. Reference & Application Number
        const matchesRef =
          (typeof app.referenceNumber === "string" && app.referenceNumber.toLowerCase().includes(q)) ||
          (typeof app.applicationNumber === "string" && app.applicationNumber.toLowerCase().includes(q));

        // 3. Official Receipt (OR) Number
        const matchesOrNumber =
          (typeof app.payment?.orNumber === "string" && app.payment.orNumber.toLowerCase().includes(q)) ||
          (typeof app.officialReceiptNumber === "string" && app.officialReceiptNumber.toLowerCase().includes(q)) ||
          (typeof app.payment?.opNumber === "string" && app.payment.opNumber.toLowerCase().includes(q));

        // 4. Statement of Account (SOA) Number
        const matchesSoaNumber =
          (typeof app.soaNumber === "string" && app.soaNumber.toLowerCase().includes(q)) ||
          (typeof app.soaId === "string" && app.soaId.toLowerCase().includes(q));

        // 5. Service Variant & Service Title
        const matchesServiceVariant =
          (typeof app.serviceVariantName === "string" && app.serviceVariantName.toLowerCase().includes(q)) ||
          (typeof app.permitTitle === "string" && app.permitTitle.toLowerCase().includes(q)) ||
          (typeof app.serviceName === "string" && app.serviceName.toLowerCase().includes(q)) ||
          (Array.isArray(app.services) &&
            app.services.some(
              (s) =>
                (typeof s.serviceVariantName === "string" && s.serviceVariantName.toLowerCase().includes(q)) ||
                (typeof s.serviceName === "string" && s.serviceName.toLowerCase().includes(q))
            ));

        // 6. Personnel Name (Assigned, Evaluating, Accounting, Cashier, Issuing, Endorsed, or History)
        const matchesPersonnel =
          (typeof app.assignedTo === "string" && app.assignedTo.toLowerCase().includes(q)) ||
          (typeof app.evaluatingOfficer === "string" && app.evaluatingOfficer.toLowerCase().includes(q)) ||
          (typeof app.accountingOfficer === "string" && app.accountingOfficer.toLowerCase().includes(q)) ||
          (typeof app.cashierOfficer === "string" && app.cashierOfficer.toLowerCase().includes(q)) ||
          (typeof app.issuingOfficer === "string" && app.issuingOfficer.toLowerCase().includes(q)) ||
          (typeof app.endorsedTo === "string" && app.endorsedTo.toLowerCase().includes(q)) ||
          (typeof app.endorsedBy === "string" && app.endorsedBy.toLowerCase().includes(q)) ||
          (Array.isArray(app.history) &&
            app.history.some(
              (h) =>
                (typeof h.staff === "string" && h.staff.toLowerCase().includes(q)) ||
                (typeof h.role === "string" && h.role.toLowerCase().includes(q))
            ));

        const matchesType = typeof app.applicationType === "string" && app.applicationType.toLowerCase().includes(q);
        const matchesMode =
          (app.applicationType === "BULK" && "bulk application".includes(q)) ||
          (app.applicationType === "SINGLE" && "single application".includes(q));

        if (
          !matchesApplicant &&
          !matchesRef &&
          !matchesOrNumber &&
          !matchesSoaNumber &&
          !matchesServiceVariant &&
          !matchesPersonnel &&
          !matchesType &&
          !matchesMode
        ) {
          return false;
        }
      }
      if (activeStatuses.size > 0) {
        const matchesStatus = activeStatuses.has(app.status);
        const matchesAssessment = activeStatuses.has("ForAssessment") && (Boolean(app.isAssessmentOnly) || app.intent === "AssessmentOnly");
        if (!matchesStatus && !matchesAssessment) return false;
      }
      if (activeCategories.size > 0 && !activeCategories.has(app.category)) return false;
      if (activeModes.size > 0 && !activeModes.has(app.applicationType)) return false;
      if (dateFrom.length === 10) {
        const appDate = new Date(app.createdAt);
        if (appDate < new Date(dateFrom)) return false;
      }
      if (dateTo.length === 10) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(app.createdAt) > to) return false;
      }
      return true;
    });
    return buildDateGroups(filtered, sortOrder);
  }, [applications, activeQueueTab, searchQuery, activeStatuses, activeCategories, activeModes, dateFrom, dateTo, sortOrder, officerName, user, currentRole]);

  const hasActiveFilters =
    activeStatuses.size > 0 ||
    activeCategories.size > 0 ||
    activeModes.size > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0;

  const visibleTabDefs = TAB_LABELS.filter((t) => visibleTabs.includes(t.key)).map((t) => {
    if (t.key === 'pending' && currentRole === 'Cashier') {
      return { ...t, label: 'For Payment' };
    }
    return t;
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.pane, { backgroundColor: bg, borderRightColor: border }]}>

      {/* ── Toolbar ── */}
      <View style={[styles.toolbar, { backgroundColor: surface, borderBottomColor: borderSoft }]}>
        <Text style={[styles.feedTitle, { color: brandColor }]}>Feed</Text>
        <View style={styles.toolbarActions}>
          {/* Sort */}
          <Pressable
            style={[
              styles.toolBtn, { backgroundColor: toolBg },
              showSortDropdown && { backgroundColor: brandBg, borderWidth: 1, borderColor: brandColor },
            ]}
            onPress={() => { setShowSortDropdown((p) => !p); setShowDatePicker(false); setShowFilterPanel(false); }}
          >
            <Lucide name="chevrons-down" size={15} color={showSortDropdown ? brandColor : textSub} />
          </Pressable>

          {/* Date range */}
          <Pressable
            style={[
              styles.toolBtn, { backgroundColor: toolBg },
              showDatePicker && { backgroundColor: brandBg, borderWidth: 1, borderColor: brandColor },
              (dateFrom || dateTo) && { backgroundColor: brandBg },
            ]}
            onPress={() => { setShowDatePicker((p) => !p); setShowSortDropdown(false); setShowFilterPanel(false); }}
          >
            <Lucide name="calendar" size={15} color={showDatePicker ? brandColor : textSub} />
          </Pressable>

          {/* Filters */}
          <Pressable
            style={[
              styles.toolBtn, { backgroundColor: toolBg },
              showFilterPanel && { backgroundColor: brandBg, borderWidth: 1, borderColor: brandColor },
              hasActiveFilters && { backgroundColor: brandBg },
            ]}
            onPress={() => { setShowFilterPanel((p) => !p); setShowSortDropdown(false); setShowDatePicker(false); }}
          >
            <Lucide name="sliders" size={15} color={showFilterPanel ? brandColor : textSub} />
            {hasActiveFilters && <View style={[styles.filterDot, { backgroundColor: brandColor }]} />}
          </Pressable>

          {/* Refresh */}
          <Pressable style={[styles.toolBtn, { backgroundColor: toolBg }]} onPress={handleReset}>
            <Lucide name="refresh-cw" size={15} color={textSub} />
          </Pressable>
        </View>
      </View>

      {/* ── Sort Dropdown ── */}
      {showSortDropdown && (
        <View style={[styles.inlinePanel, { backgroundColor: surface, borderBottomColor: border }]}>
          {(["newest", "oldest"] as const).map((order) => (
            <Pressable
              key={order}
              style={[styles.sortOption, { borderRadius: RADIUS.sm }, sortOrder === order && { backgroundColor: brandBg }]}
              onPress={() => { setSortOrder(order); setShowSortDropdown(false); }}
            >
              <Lucide name={order === "newest" ? "arrow-down" : "arrow-up"} size={13} color={sortOrder === order ? brandColor : textSub} />
              <Text style={[styles.sortOptionText, { color: sortOrder === order ? brandColor : textSub, flex: 1 }, sortOrder === order && { fontWeight: TYPOGRAPHY.weights.semibold }]}>
                {order === "newest" ? "Newest First" : "Oldest First"}
              </Text>
              {sortOrder === order && <Lucide name="check" size={13} color={brandColor} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Date Range Picker ── */}
      {showDatePicker && (
        <View style={[styles.inlinePanel, { backgroundColor: surface, borderBottomColor: border }]}>
          <Text style={[styles.panelSectionTitle, { color: textMuted }]}>DATE RANGE FILTER</Text>
          <View style={styles.dateRow}>
            {(["From", "To"] as const).map((label, i) => (
              <View key={label} style={styles.dateField}>
                <DatePickerInput
                  label={label.toUpperCase()}
                  placeholder="YYYY-MM-DD"
                  value={i === 0 ? dateFrom : dateTo}
                  onChangeText={i === 0 ? setDateFrom : setDateTo}
                />
              </View>
            ))}
          </View>
          <View style={styles.dateActions}>
            <Pressable
              style={[styles.dateClearBtn, { borderColor: border }]}
              onPress={() => { setDateFrom(""); setDateTo(""); }}
            >
              <Text style={[styles.dateClearText, { color: textSub }]}>Clear</Text>
            </Pressable>
            <Pressable
              style={[styles.dateApplyBtn, { backgroundColor: brandColor }]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.dateApplyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Filter Panel ── */}
      {showFilterPanel && (
        <View style={[styles.inlinePanel, { backgroundColor: surface, borderBottomColor: border }]}>
          <View style={styles.filterPanelHeader}>
            <Text style={[styles.panelSectionTitle, { color: textMuted }]}>Status Filters</Text>
            <Pressable onPress={() => setShowFilterPanel(false)}>
              <Lucide name="x" size={15} color={textMuted} />
            </Pressable>
          </View>
          {FILTER_STATUSES.map((s) => (
            <View key={s.value} style={[styles.filterRow, { borderBottomColor: borderSoft }]}>
              <View style={styles.filterRowLeft}>
                <Lucide name={s.icon} size={14} color={textMuted} />
                <Text style={[styles.filterRowLabel, { color: text }]}>{s.label}</Text>
              </View>
              <Switch
                value={activeStatuses.has(s.value)}
                onValueChange={() => toggleStatus(s.value)}
                trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: brandColor }}
                thumbColor={COLORS.neutral.white}
              />
            </View>
          ))}

          <View style={[styles.filterPanelHeader, { marginTop: SPACING[12] }]}>
            <Text style={[styles.panelSectionTitle, { color: textMuted }]}>Application Mode</Text>
          </View>
          {FILTER_MODES.map((m) => (
            <View key={m.value} style={[styles.filterRow, { borderBottomColor: borderSoft }]}>
              <View style={styles.filterRowLeft}>
                <Lucide name={m.icon} size={14} color={textMuted} />
                <Text style={[styles.filterRowLabel, { color: text }]}>{m.label}</Text>
              </View>
              <Switch
                value={activeModes.has(m.value)}
                onValueChange={() => toggleMode(m.value)}
                trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: brandColor }}
                thumbColor={COLORS.neutral.white}
              />
            </View>
          ))}

          <View style={[styles.filterPanelHeader, { marginTop: SPACING[12] }]}>
            <Text style={[styles.panelSectionTitle, { color: textMuted }]}>Category Filters</Text>
          </View>
          {FILTER_CATEGORIES.map((c) => (
            <View key={c.value} style={[styles.filterRow, { borderBottomColor: borderSoft }]}>
              <View style={styles.filterRowLeft}>
                <Lucide name={c.icon} size={14} color={textMuted} />
                <Text style={[styles.filterRowLabel, { color: text }]}>{c.label}</Text>
              </View>
              <Switch
                value={activeCategories.has(c.value)}
                onValueChange={() => toggleCategory(c.value)}
                trackColor={{ false: isDark ? colors.neutral[700] : colors.neutral[200], true: brandColor }}
                thumbColor={COLORS.neutral.white}
              />
            </View>
          ))}
        </View>
      )}

      {/* ── Search ── */}
      <View style={[styles.searchWrapper, { backgroundColor: inputBg, borderColor: border }]}>
        <Lucide name="search" size={14} color={textMuted} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Search by Ref, OR, SOA, applicant, variant, personnel..."
          placeholderTextColor={textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search applications by Reference, OR, SOA, applicant, variant, or personnel"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Lucide name="x" size={13} color={textMuted} />
          </Pressable>
        )}
      </View>

      {/* ── Tab Bar ── */}
      <View style={[styles.tabBar, { backgroundColor: surface, borderBottomColor: border }]}>
        {visibleTabDefs.map((tab) => {
          const isActive = activeQueueTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveQueueTab?.(tab.key)}
            >
              <Text style={[styles.tabText, { color: isActive ? brandColor : textMuted }, isActive && { fontWeight: TYPOGRAPHY.weights.semibold }]}>
                {tab.label}
              </Text>
              {isActive && <View style={[styles.tabUnderline, { backgroundColor: brandColor }]} />}
            </Pressable>
          );
        })}
      </View>

      {/* ── Feed List ── */}
      <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: SPACING[12], gap: SPACING[12] }}>
            {[1, 2, 3, 4, 5].map((idx) => (
              <View
                key={idx}
                style={{
                  padding: SPACING[16],
                  borderRadius: RADIUS.card,
                  borderWidth: 1,
                  borderColor: borderSoft,
                  backgroundColor: surface,
                  gap: SPACING[10],
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SkeletonLoader width={130} height={14} borderRadius={4} />
                  <SkeletonLoader width={75} height={20} borderRadius={10} />
                </View>
                <SkeletonLoader width={180} height={18} borderRadius={4} />
                <SkeletonLoader width={140} height={13} borderRadius={4} />
              </View>
            ))}
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Lucide name="inbox" size={28} color={textMuted} />
            <Text style={[styles.emptyTitle, { color: textMuted }]}>No applications</Text>
            <Text style={[styles.emptySubtitle, { color: textMuted }]}>
              {hasActiveFilters ? "Try clearing your filters." : "Nothing here yet."}
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.dateKey);
            return (
              <View key={group.dateKey}>
                <Pressable
                  style={[styles.groupHeader, { borderBottomColor: border }]}
                  onPress={() => toggleGroupCollapse(group.dateKey)}
                >
                  <Text style={[styles.groupLabel, { color: textSub }]}>{group.label}</Text>
                  <Lucide
                    name={isCollapsed ? "chevron-down" : "chevron-up"}
                    size={14}
                    color={textMuted}
                  />
                </Pressable>
                {!isCollapsed &&
                  group.items.map((app) => (
                    <ActivityCard
                      key={app.id}
                      application={app}
                      isActive={selectedId === app.id}
                      onPress={() => setSelectedId?.(app.id)}
                      currentUserName={officerName}
                      isAdmin={isAdmin}
                      onMenuAction={(action, id) => {
                        if (action === "evaluate") {
                          void evaluateApplication(id);
                        } else if (action === "release_evaluation") {
                          void releaseEvaluation(id);
                        } else if (action === "pin") {
                          void togglePinApplication(id);
                        } else if (action === "archive") {
                          void toggleArchiveApplication(id);
                        }
                      }}
                    />
                  ))}
              </View>
            );
          })
        )}

        {/* Footer */}
        {filteredGroups.length > 0 && (
          <View style={styles.seeMoreRow}>
            <Text style={[styles.seeMoreText, { color: textMuted }]}>
              Showing {filteredGroups.reduce((acc, g) => acc + g.items.length, 0)}
              {pagination?.totalCount !== undefined ? ` of ${pagination.totalCount}` : ""}{" "}
              activities
            </Text>
            {hasMore ? (
              <Pressable
                disabled={isLoading || isLoadingMore}
                style={[
                  styles.loadMoreBtn,
                  { backgroundColor: surface, borderColor: border },
                  (isLoading || isLoadingMore) && { opacity: 0.6 },
                  Platform.select({ web: { cursor: isLoading || isLoadingMore ? 'auto' : 'pointer' } }),
                ]}
                onPress={handleLoadMore}
              >
                {isLoadingMore ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={brandColor} />
                    <Text style={[styles.loadMoreText, { color: brandColor }]}>Loading...</Text>
                  </View>
                ) : (
                  <Text style={[styles.loadMoreText, { color: brandColor }]}>Load older activities</Text>
                )}
              </Pressable>
            ) : (
              <Text style={[styles.allLoadedText, { color: textMuted }]}>All activities loaded</Text>
            )}
          </View>
        )}

        <View style={{ height: SPACING[32] }} />
      </ScrollView>
    </View>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────
// All colors are injected inline via useTheme(); only structural/shape values live here.

const styles = StyleSheet.create({
  pane: {
    flex: 1,
    borderRightWidth: 1,
    flexDirection: "column",
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[12],
    paddingTop: SPACING[12],
    paddingBottom: SPACING[10],
    borderBottomWidth: 1,
  },
  feedTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  toolbarActions: {
    flexDirection: "row",
    gap: SPACING[4],
  },
  toolBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  filterDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.neutral.white,
  },
  inlinePanel: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
  },
  panelSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING[6],
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[8],
  },
  sortOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING[8],
    marginBottom: SPACING[10],
  },
  dateField: {
    flex: 1,
    gap: 3,
  },
  dateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: "uppercase",
  },
  dateInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[6],
  },
  dateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING[8],
  },
  dateClearBtn: {
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  dateClearText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  dateApplyBtn: {
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
  },
  dateApplyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  filterPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING[6],
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING[6],
    borderBottomWidth: 1,
  },
  filterRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  filterRowLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    margin: SPACING[10],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    outlineStyle: "none",
  } as object,
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: SPACING[12],
  },
  tabItem: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    position: "relative",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: SPACING[12],
    right: SPACING[12],
    height: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  feedScroll: {
    flex: 1,
    paddingHorizontal: SPACING[10],
    paddingTop: SPACING[8],
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[4],
    borderBottomWidth: 1,
    marginBottom: SPACING[6],
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  groupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING[48],
    gap: SPACING[8],
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  seeMoreRow: {
    padding: SPACING[16],
    alignItems: "center",
    gap: SPACING[10],
  },
  seeMoreText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    textAlign: "center",
  },
  loadMoreBtn: {
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  loadMoreText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  allLoadedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontStyle: "italic",
  },
});
