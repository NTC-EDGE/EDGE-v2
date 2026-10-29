import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Modal,
} from "react-native";
import { Icon } from "@edge/ui";
import { useApi } from "../../shared/hooks/useApi";
import {
  Application,
  ModeFilterOption,
  StatusFilterOption,
  getAppDocuments,
  getStatusLabel,
  ApplicationDocument,
  ApiApplicationDto,
  mapApiApplicationToApplication,
} from "./data/applicationsData";

function mapStatusFilterToBackend(status: StatusFilterOption): string | null {
  switch (status) {
    case 'PENDING':
      return 'Submitted';
    case 'FOR_EVALUATION':
      return 'Evaluating';
    case 'READY_FOR_PAYMENT':
    case 'PAYMENT_SUBMITTED':
      return 'PendingPayment';
    case 'FOR_APPROVAL':
      return 'ForIssuance';
    case 'APPROVED':
      return 'Completed';
    case 'DECLINED':
      return 'Returned';
    case 'EXPIRING_SOON':
      return null;
    default:
      return null;
  }
}
import { ApplicationCard, ApplicationDetailsPage } from "./components";
import { ClientAppLayout } from "../../shared/components/ClientAppLayout";
import {
  subscribeToApplicationDetail,
  consumePendingApplicationDetail,
} from "../../shared/helpers/applicationNavigationHelper";
import { downloadApplicationDocument } from "./helpers/applicationDocumentActions";
import { styles } from "./MyApplications.styles";

interface SingleApplicationResponse {
  succeeded?: boolean;
  data?: ApiApplicationDto;
}

const LIST_PAGE_SIZE = 6;

export function MyApplications() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const api = useApi();

  // Applications list state from API
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter & Search state
  const [filterText, setFilterText] = useState("");
  const [selectedMode, setSelectedMode] = useState<ModeFilterOption>("ALL");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilterOption>("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown open state
  const [openDropdown, setOpenDropdown] = useState<
    "TYPE" | "STATUS" | "SORT" | null
  >(null);

  // Selected Modal Application Detail state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Renewal state
  const [renewalTargetApp, setRenewalTargetApp] = useState<Application | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Search focus state
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Server-provided counts & statistics
  const [serverStats, setServerStats] = useState<{
    totalCount: number;
    singleCount: number;
    bulkCount: number;
    readyDocsCount: number;
  } | null>(null);
  const [serverTotalCount, setServerTotalCount] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(filterText);

  // Handler to load application by ID directly if navigated from notification
  const openAppById = useCallback(
    async (appId: string) => {
      const found = applications.find((a) => a.id === appId);
      if (found !== undefined) {
        setSelectedApp(found);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get<SingleApplicationResponse>(`/api/v2/applications/${appId}`);
        if (res !== null && res.succeeded === true && res.data !== null && res.data !== undefined) {
          const mapped = mapApiApplicationToApplication(res.data);
          setSelectedApp(mapped);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    },
    [applications, api]
  );

  // Subscribe to cross-screen notification clicks
  useEffect(() => {
    const pendingId = consumePendingApplicationDetail();
    if (pendingId !== null) {
      openAppById(pendingId);
    }

    const unsubscribe = subscribeToApplicationDetail((appId) => {
      openAppById(appId);
    });

    return unsubscribe;
  }, [openAppById]);

  useEffect(() => {
    if (filterText === debouncedSearch) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(filterText);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [filterText, debouncedSearch]);

  // Fetch applications from /api/v2/applications/me with pagination, search, and mode/status filters
  const fetchApplications = useCallback(async (isSilent = false) => {
    let isMounted = true;
    try {
      if (!isSilent) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      const params = new URLSearchParams();
      params.set("pageNumber", String(currentPage));
      params.set("pageSize", String(LIST_PAGE_SIZE));

      if (debouncedSearch.trim()) {
        params.set("searchTerm", debouncedSearch.trim());
      }
      if (selectedMode !== "ALL") {
        if (selectedMode !== "ASSESSMENT") {
          params.set("mode", selectedMode === "SINGLE" ? "Single" : "Bulk");
        }
      }
      if (selectedStatus !== "ALL") {
        const backendStatus = mapStatusFilterToBackend(selectedStatus);
        if (backendStatus !== null) {
          params.set("status", backendStatus);
        }
      }

      const res = await api.get<unknown>(`/api/v2/applications/me?${params.toString()}`);
      if (!isMounted) return;

      if (res !== null && typeof res === "object") {
        const resObj = res as {
          succeeded?: boolean;
          data?: {
            items?: unknown[];
            totalCount?: number;
            totalPages?: number;
            pageNumber?: number;
            statistics?: {
              totalCount?: number;
              singleCount?: number;
              bulkCount?: number;
              readyDocsCount?: number;
            };
          } | unknown[];
        };

        let rawList: unknown[] = [];
        if (resObj.succeeded && resObj.data !== null && typeof resObj.data === "object") {
          if (Array.isArray(resObj.data)) {
            rawList = resObj.data;
            setServerTotalCount(resObj.data.length);
            setServerTotalPages(Math.max(1, Math.ceil(resObj.data.length / LIST_PAGE_SIZE)));
          } else if ("items" in resObj.data && Array.isArray(resObj.data.items)) {
            rawList = resObj.data.items;
            const count = resObj.data.totalCount ?? rawList.length;
            setServerTotalCount(count);
            setServerTotalPages(resObj.data.totalPages ?? Math.max(1, Math.ceil(count / LIST_PAGE_SIZE)));
            if (resObj.data.statistics) {
              setServerStats({
                totalCount: resObj.data.statistics.totalCount ?? 0,
                singleCount: resObj.data.statistics.singleCount ?? 0,
                bulkCount: resObj.data.statistics.bulkCount ?? 0,
                readyDocsCount: resObj.data.statistics.readyDocsCount ?? 0,
              });
            }
          }
        } else if (Array.isArray(res)) {
          rawList = res;
          setServerTotalCount(res.length);
          setServerTotalPages(Math.max(1, Math.ceil(res.length / LIST_PAGE_SIZE)));
        }

        const mappedList: Application[] = rawList.map((item) =>
          mapApiApplicationToApplication(
            item as Parameters<typeof mapApiApplicationToApplication>[0]
          )
        );
        setApplications(mappedList);

        // Keep active detail modal up to date in real-time when status changes
        setSelectedApp((prev) => {
          if (!prev) return null;
          const updated = mappedList.find((a) => a.id === prev.id);
          return updated || prev;
        });
      } else {
        setApplications([]);
        setServerTotalCount(0);
        setServerTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load user applications:", err);
      if (isMounted && !isSilent) {
        setErrorMessage("Unable to load applications. Please check your connection.");
      }
    } finally {
      if (isMounted && !isSilent) {
        setIsLoading(false);
      }
    }
  }, [currentPage, debouncedSearch, selectedMode, selectedStatus]);

  const handleManualRefresh = useCallback(() => {
    fetchApplications(false);
  }, [fetchApplications]);

  const handleOpenRenewal = useCallback((app: Application) => {
    setRenewalTargetApp(app);
  }, []);

  const handleConfirmRenewal = useCallback(async () => {
    if (!renewalTargetApp) return;
    setIsRenewing(true);
    try {
      const doc = Array.isArray(renewalTargetApp.issuedDocumentDetails) && renewalTargetApp.issuedDocumentDetails.length > 0
        ? renewalTargetApp.issuedDocumentDetails[0]
        : undefined;

      const applicantObj = Array.isArray(renewalTargetApp.applicants) && renewalTargetApp.applicants.length > 0
        ? renewalTargetApp.applicants[0]
        : null;

      const fallbackFirstName = applicantObj?.name ? applicantObj.name.split(' ')[0] : '';
      const fallbackLastName = applicantObj?.name ? applicantObj.name.split(' ').slice(1).join(' ') : '';

      const detailsObj = applicantObj?.details ? applicantObj.details : {
        firstName: fallbackFirstName,
        lastName: fallbackLastName,
        mobileNumber: applicantObj?.mobileNumber,
        email: applicantObj?.email,
        address: applicantObj?.streetAddress,
        cityMunicipality: applicantObj?.cityMunicipality,
        province: applicantObj?.province,
        region: applicantObj?.region,
      };

      const payload = {
        tenantId: renewalTargetApp.tenantId,
        serviceId: renewalTargetApp.serviceId,
        serviceVariantId: renewalTargetApp.serviceVariantId,
        submissionMode: renewalTargetApp.mode === 'BULK' ? 'Bulk' : 'Single',
        isDraft: true,
        renewedFromApplicationId: renewalTargetApp.id,
        applicants: applicantObj ? [
          {
            applicantType: applicantObj.applicationType || 'Individual',
            name: applicantObj.name,
            details: detailsObj,
            formFieldValues: [
              ...(applicantObj.formFieldValues || []),
              ...(doc?.licenseNumber ? [{ fieldId: 'previous-license-number', fieldLabel: 'Previous License Number', value: doc.licenseNumber }] : []),
              ...(doc?.expiryDate ? [{ fieldId: 'previous-expiry-date', fieldLabel: 'Previous Expiration Date', value: doc.expiryDate }] : []),
            ]
          }
        ] : []
      };

      const endpoint = renewalTargetApp.tenantId
        ? `/api/v2/tenants/${renewalTargetApp.tenantId}/applications`
        : `/api/v2/applications`;

      await api.post(endpoint, payload);
      setToastMessage(`Renewal draft created for ${renewalTargetApp.serviceName || 'license'}.`);
      setTimeout(() => setToastMessage(null), 4000);
      setRenewalTargetApp(null);
      await fetchApplications(true);
    } catch (err: unknown) {
      console.error('Failed to initiate renewal:', err);
      setToastMessage('Could not initiate renewal draft. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsRenewing(false);
    }
  }, [renewalTargetApp, api, fetchApplications]);

  useEffect(() => {
    let isMounted = true;
    fetchApplications(false);

    // Live background polling every 3 seconds so status changes reflect without page refresh
    const timer = setInterval(() => {
      if (isMounted) {
        fetchApplications(true);
      }
    }, 3000);

    const handleFocus = () => {
      if (isMounted) {
        fetchApplications(true);
      }
    };

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [fetchApplications]);

  // Sorted & Filtered Applications
  const displayedApps = useMemo<Application[]>(() => {
    let list = [...applications];
    if (selectedMode === "ASSESSMENT") {
      list = list.filter((a) => a.isAssessmentOnly || a.intent === "AssessmentOnly");
    }
    if (selectedStatus !== "ALL") {
      list = list.filter((a) => a.status === selectedStatus);
    }
    return list.sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [applications, selectedMode, selectedStatus, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    if (serverStats !== null) {
      return serverStats;
    }
    const totalCount = applications.length;
    const singleCount = applications.filter(
      (a) => a.mode === "SINGLE"
    ).length;
    const bulkCount = applications.filter((a) => a.mode === "BULK").length;
    const readyDocsCount = applications.reduce(
      (acc, app) => acc + getAppDocuments(app).length,
      0
    );

    return { totalCount, singleCount, bulkCount, readyDocsCount };
  }, [applications, serverStats]);

  // Download Handler
  const handleDownloadDoc = async (doc: ApplicationDocument) => {
    setToastMessage(`Downloading document "${doc.name}"...`);
    try {
      const res = await downloadApplicationDocument(doc, selectedApp, null);
      setToastMessage(res.message);
    } catch {
      setToastMessage(`Downloaded "${doc.name}" successfully.`);
    } finally {
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }
  };

  const toggleDropdown = (key: "TYPE" | "STATUS" | "SORT") => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <ClientAppLayout activeTab="my-applications">
      <View style={styles.contentColumn}>
        {selectedApp !== null ? (
          <ApplicationDetailsPage
            app={selectedApp}
            onBack={() => {
              setSelectedApp(null);
              fetchApplications(true);
            }}
            onRenew={handleOpenRenewal}
            onDownloadDoc={handleDownloadDoc}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setOpenDropdown(null)}
          >
            {/* ── Hero Section ───────────────────────────────────────────── */}
            <View style={[
              styles.heroHeader,
              {
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "flex-start",
                gap: 12,
              }
            ]}>
              <View style={{ flex: isMobile ? undefined : 1, paddingRight: isMobile ? 0 : 16 }}>
                <Text style={[styles.heroTitle, isMobile && { fontSize: 20 }]}>My Applications Dashboard</Text>
                <Text style={styles.heroSubtitle}>
                  View details, check status timelines, and download official
                  documents for your single and bulk applications.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleManualRefresh}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  gap: 6,
                  alignSelf: isMobile ? "flex-start" : "auto",
                }}
                activeOpacity={0.8}
              >
                <Icon name="refresh-cw" size={14} color="#1D4ED8" />
                <Text style={{ fontFamily: "Inter", fontSize: 12, fontWeight: "700", color: "#1D4ED8" }}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── 4 Stat Metric Cards ────────────────────────────────────── */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "#EFF6FF" },
                  ]}
                >
                  <Icon name="file-text" size={20} color="#2563EB" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>TOTAL APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.totalCount}</Text>
                  <Text style={styles.statSubtext}>Submitted records</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "#EEF2FF" },
                  ]}
                >
                  <Icon name="user" size={20} color="#2F56E8" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>SINGLE APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.singleCount}</Text>
                  <Text style={styles.statSubtext}>1 Applicant per app</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "#FFFBEB" },
                  ]}
                >
                  <Icon name="users" size={20} color="#D97706" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>BULK APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.bulkCount}</Text>
                  <Text style={styles.statSubtext}>
                    Multiple applicants batch
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <Icon name="download" size={20} color="#16A34A" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>READY DOCUMENTS</Text>
                  <Text style={[styles.statValue, { color: "#16A34A" }]}>
                    {stats.readyDocsCount}
                  </Text>
                  <Text style={styles.statSubtext}>Permits & receipts</Text>
                </View>
              </View>
            </View>

            {/* ── Search Bar & Dropdown Select Filters Toolbar ─────────────── */}
            <View style={styles.toolbarPanel}>
              {/* Standard Premium Search Bar Input */}
              <View
                style={[
                  styles.searchInputContainer,
                  isSearchFocused && styles.searchInputContainerFocused,
                  filterText.length > 0 && styles.searchInputContainerActive,
                ]}
              >
                <Icon
                  name="search"
                  size={18}
                  color={
                    isSearchFocused || filterText.length > 0
                      ? "#2563EB"
                      : "#64748B"
                  }
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search by application #, applicant name, company, or service..."
                  placeholderTextColor="#94A3B8"
                  value={filterText}
                  onChangeText={setFilterText}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={styles.searchInput}
                />
                {filterText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFilterText("")}
                    style={styles.clearSearchBtn}
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={15} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Filters Group */}
              <View style={styles.dropdownsGroup}>
                {/* Dropdown 1: Application Type */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown("TYPE")}
                    style={[
                      styles.dropdownTrigger,
                      selectedMode !== "ALL" && styles.dropdownTriggerActive,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="layers"
                      size={14}
                      color={selectedMode !== "ALL" ? "#1D4ED8" : "#64748B"}
                    />
                    <Text style={styles.dropdownLabelText}>
                      {selectedMode === "ALL"
                        ? "Type: All"
                        : selectedMode === "SINGLE"
                          ? "Type: Single"
                          : selectedMode === "BULK"
                            ? "Type: Bulk"
                            : "Type: Assessment"}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === "TYPE" && (
                    <View style={styles.dropdownMenu}>
                      {(["ALL", "SINGLE", "BULK", "ASSESSMENT"] as ModeFilterOption[]).map(
                        (mode) => (
                          <TouchableOpacity
                            key={mode}
                            onPress={() => {
                              setSelectedMode(mode);
                              setCurrentPage(1);
                              setOpenDropdown(null);
                            }}
                            style={[
                              styles.dropdownOption,
                              selectedMode === mode &&
                                styles.dropdownOptionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                selectedMode === mode &&
                                  styles.dropdownOptionTextSelected,
                              ]}
                            >
                              {mode === "ALL"
                                ? "All Application Types"
                                : mode === "SINGLE"
                                  ? "Single Applications"
                                  : mode === "BULK"
                                    ? "Bulk Applications"
                                    : "Pre-Assessments Only"}
                            </Text>
                            {selectedMode === mode && (
                              <Icon name="check" size={14} color="#1D4ED8" />
                            )}
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  )}
                </View>

                {/* Dropdown 2: Application Status */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown("STATUS")}
                    style={[
                      styles.dropdownTrigger,
                      selectedStatus !== "ALL" &&
                        styles.dropdownTriggerActive,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name="filter"
                      size={14}
                      color={selectedStatus !== "ALL" ? "#1D4ED8" : "#64748B"}
                    />
                    <Text style={styles.dropdownLabelText}>
                      {selectedStatus === "ALL"
                        ? "Status: All"
                        : `Status: ${getStatusLabel(selectedStatus)}`}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === "STATUS" && (
                    <View style={styles.dropdownMenu}>
                      {(
                        [
                          ["ALL", "All Statuses"],
                          ["PENDING", "Submitted"],
                          ["FOR_EVALUATION", "For Evaluation"],
                          ["READY_FOR_PAYMENT", "For Payment"],
                          ["PAYMENT_SUBMITTED", "Verification in Progress"],
                          ["FOR_APPROVAL", "For Issuance"],
                          ["APPROVED", "Issued"],
                          ["DECLINED", "Returned"],
                          ["EXPIRING_SOON", "Expiring Soon"],
                        ] as [StatusFilterOption, string][]
                      ).map(([val, label]) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setSelectedStatus(val);
                            setCurrentPage(1);
                            setOpenDropdown(null);
                          }}
                          style={[
                            styles.dropdownOption,
                            selectedStatus === val &&
                              styles.dropdownOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedStatus === val &&
                                styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                          {selectedStatus === val && (
                            <Icon name="check" size={14} color="#1D4ED8" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dropdown 3: Sort Order */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown("SORT")}
                    style={styles.dropdownTrigger}
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={
                        sortOrder === "NEWEST" ? "arrow-down" : "arrow-up"
                      }
                      size={14}
                      color="#64748B"
                    />
                    <Text style={styles.dropdownLabelText}>
                      {sortOrder === "NEWEST"
                        ? "Sort: Newest"
                        : "Sort: Oldest"}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === "SORT" && (
                    <View style={styles.dropdownMenu}>
                      {[
                        { key: "NEWEST", label: "Newest First" },
                        { key: "OLDEST", label: "Oldest First" },
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => {
                            setSortOrder(opt.key as "NEWEST" | "OLDEST");
                            setOpenDropdown(null);
                          }}
                          style={[
                            styles.dropdownOption,
                            sortOrder === opt.key &&
                              styles.dropdownOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              sortOrder === opt.key &&
                                styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {sortOrder === opt.key && (
                            <Icon name="check" size={14} color="#1D4ED8" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Applications Cards Container ────────────────────────────── */}
            <View style={styles.cardsContainer}>
              {isLoading ? (
                <View style={[styles.emptyStateCard, { paddingVertical: 48 }]}>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text style={[styles.emptyStateTitle, { marginTop: 16 }]}>
                    Loading applications...
                  </Text>
                  <Text style={styles.emptyStateSub}>
                    Fetching your latest filed applications from the NTC portal.
                  </Text>
                </View>
              ) : errorMessage !== null ? (
                <View style={[styles.emptyStateCard, { paddingVertical: 36, borderColor: "#FECACA", backgroundColor: "#FEF2F2" }]}>
                  <Icon name="alert-circle" size={36} color="#DC2626" />
                  <Text style={[styles.emptyStateTitle, { color: "#991B1B", marginTop: 12 }]}>
                    {errorMessage}
                  </Text>
                  <TouchableOpacity
                    onPress={handleManualRefresh}
                    style={{
                      marginTop: 16,
                      backgroundColor: "#DC2626",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontFamily: "Inter", fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : displayedApps.length === 0 ? (
                <View style={styles.emptyStateCard}>
                  <Icon name="file-text" size={36} color="#CBD5E1" />
                  <Text style={styles.emptyStateTitle}>
                    {filterText.trim() !== "" || selectedMode !== "ALL" || selectedStatus !== "ALL"
                      ? "No applications found matching your criteria"
                      : "No filed applications yet"}
                  </Text>
                  <Text style={styles.emptyStateSub}>
                    {filterText.trim() !== "" || selectedMode !== "ALL" || selectedStatus !== "ALL"
                      ? "Try clearing the search or selecting different options from the filters above."
                      : "Start by selecting a service from the Services catalog to submit your first application."}
                  </Text>
                </View>
              ) : (
                displayedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onPress={() => setSelectedApp(app)}
                    onRenew={handleOpenRenewal}
                  />
                ))
              )}
            </View>

            {/* ── Pagination Bar ────────────────────────────────────────────── */}
            {serverTotalPages > 1 && serverTotalCount > 0 && displayedApps.length > 0 && (
              <View style={styles.paginationBar}>
                <Text style={styles.paginationSummary}>
                  Showing {(currentPage - 1) * LIST_PAGE_SIZE + 1} to{" "}
                  {Math.min(
                    currentPage * LIST_PAGE_SIZE,
                    serverTotalCount,
                  )}{" "}
                  of {serverTotalCount} applications
                </Text>

                <View style={styles.paginationBtns}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    style={[
                      styles.pageNavBtn,
                      (currentPage === 1 || isLoading) && styles.pageNavBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-left"
                      size={16}
                      color={currentPage === 1 || isLoading ? "#CBD5E1" : "#334155"}
                    />
                  </TouchableOpacity>

                  {Array.from({ length: serverTotalPages }, (_, i) => i + 1).map(
                    (pg) => (
                      <TouchableOpacity
                        key={pg}
                        onPress={() => setCurrentPage(pg)}
                        disabled={isLoading}
                        style={[
                          styles.pageNumberBtn,
                          pg === currentPage && styles.pageNumberBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pageNumberBtnText,
                            pg === currentPage &&
                              styles.pageNumberBtnTextActive,
                          ]}
                        >
                          {pg}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}

                  <TouchableOpacity
                    onPress={() =>
                      setCurrentPage((p) => Math.min(serverTotalPages, p + 1))
                    }
                    disabled={currentPage === serverTotalPages || isLoading}
                    style={[
                      styles.pageNavBtn,
                      (currentPage === serverTotalPages || isLoading) && styles.pageNavBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={
                        currentPage === serverTotalPages || isLoading ? "#CBD5E1" : "#334155"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* ── Renewal Confirmation Modal ── */}
      <Modal
        visible={renewalTargetApp !== null}
        transparent
        animationType="fade"
        onRequestClose={() => !isRenewing && setRenewalTargetApp(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              maxWidth: 480,
              width: "100%",
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="refresh-cw" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
                  Renew Permit / License
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B" }}>
                  Ref #{renewalTargetApp?.referenceNumber}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 14, color: "#334155", lineHeight: 20, marginBottom: 16 }}>
              You are initiating a renewal application for{" "}
              <Text style={{ fontWeight: "700" }}>{renewalTargetApp?.serviceName}</Text>.
            </Text>

            <View
              style={{
                backgroundColor: "#F8FAFC",
                borderColor: "#E2E8F0",
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Issued Document:</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#0F172A" }}>
                  {renewalTargetApp?.issuedDocumentDetails?.[0]?.documentType || "Statutory Document"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>License Number:</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#0F172A", fontFamily: "monospace" }}>
                  {renewalTargetApp?.issuedDocumentDetails?.[0]?.licenseNumber || renewalTargetApp?.issuedDocumentDetails?.[0]?.formNumber || "N/A"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Current Expiry Date:</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#D97706" }}>
                  {renewalTargetApp?.issuedDocumentDetails?.[0]?.expiryDate ? new Date(renewalTargetApp.issuedDocumentDetails[0].expiryDate).toLocaleDateString() : "N/A"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Renewal Extension:</Text>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#059669" }}>
                  +1 Year to original expiration
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 20, lineHeight: 18 }}>
              • A linked renewal application draft will be prepared with your credentials.{"\n"}
              • You will be able to review, update any required attachments, and submit.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                disabled={isRenewing}
                onPress={() => setRenewalTargetApp(null)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: "#F1F5F9",
                }}
              >
                <Text style={{ color: "#475569", fontWeight: "600", fontSize: 14 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isRenewing}
                onPress={handleConfirmRenewal}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  backgroundColor: "#D97706",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isRenewing && <ActivityIndicator size="small" color="#FFFFFF" />}
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                  {isRenewing ? "Creating Draft..." : "Confirm Renewal"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Toast Feedback Notification ─────────────────────────────────── */}
      {toastMessage !== null && (
        <View style={styles.toastContainer}>
          <Icon name="check-circle" size={18} color="#22C55E" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </ClientAppLayout>
  );
}
