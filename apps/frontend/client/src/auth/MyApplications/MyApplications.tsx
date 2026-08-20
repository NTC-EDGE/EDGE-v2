import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  mapApiApplicationToApplication,
} from "./data/applicationsData";
import { ApplicationCard, ApplicationDetailsPage } from "./components";
import { ClientAppLayout } from "../../shared/components/ClientAppLayout";
import { styles } from "./MyApplications.styles";

const LIST_PAGE_SIZE = 6;

export function MyApplications() {
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filterText);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [filterText]);

  // Fetch applications from /api/v2/myapplications/me with pagination, search, and mode/status filters
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams();
      params.set("pageNumber", String(currentPage));
      params.set("pageSize", String(LIST_PAGE_SIZE));

      if (debouncedSearch.trim()) {
        params.set("searchTerm", debouncedSearch.trim());
      }
      if (selectedMode !== "ALL") {
        params.set("mode", selectedMode === "SINGLE" ? "Single" : "Bulk");
      }
      if (selectedStatus !== "ALL") {
        params.set("status", selectedStatus);
      }

      const res = await api.get<unknown>(`/api/v2/applications/me?${params.toString()}`);
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
      } else {
        setApplications([]);
        setServerTotalCount(0);
        setServerTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load user applications:", err);
      setErrorMessage("Unable to load applications. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedMode, selectedStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Sorted Applications
  const displayedApps = useMemo<Application[]>(() => {
    return [...applications].sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [applications, sortOrder]);

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

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMode, selectedStatus, sortOrder]);

  // Download Handler
  const handleDownloadDoc = (doc: ApplicationDocument) => {
    setToastMessage(`Downloading document "${doc.name}"...`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
            onBack={() => setSelectedApp(null)}
            onDownloadDoc={handleDownloadDoc}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setOpenDropdown(null)}
          >
            {/* ── Hero Section ───────────────────────────────────────────── */}
            <View style={[styles.heroHeader, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.heroTitle}>My Applications Dashboard</Text>
                <Text style={styles.heroSubtitle}>
                  View details, check status timelines, and download official
                  documents for your single and bulk applications.
                </Text>
              </View>
              <TouchableOpacity
                onPress={fetchApplications}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  gap: 6,
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
                          : "Type: Bulk"}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === "TYPE" && (
                    <View style={styles.dropdownMenu}>
                      {(["ALL", "SINGLE", "BULK"] as ModeFilterOption[]).map(
                        (mode) => (
                          <TouchableOpacity
                            key={mode}
                            onPress={() => {
                              setSelectedMode(mode);
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
                                  : "Bulk Applications"}
                            </Text>
                            {selectedMode === mode && (
                              <Icon name="check" size={14} color="#1D4ED8" />
                            )}
                          </TouchableOpacity>
                        ),
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
                          ["FOR_APPROVAL", "For Approval"],
                          ["FOR_EVALUATION", "For Evaluation"],
                          ["APPROVED", "Approved"],
                          ["EXPIRING_SOON", "Expiring Soon"],
                          ["PENDING", "Pending"],
                        ] as [StatusFilterOption, string][]
                      ).map(([val, label]) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setSelectedStatus(val);
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
                    onPress={fetchApplications}
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
                      ? "No applications match your filter"
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
                    onDownloadDoc={handleDownloadDoc}
                  />
                ))
              )}
            </View>

            {/* ── Pagination Bar ────────────────────────────────────────────── */}
            {serverTotalPages > 1 && (
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
