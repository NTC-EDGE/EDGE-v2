import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationStatus,
  ApplicationCategory,
} from "../data/mockApplications";
import { ActivityCard } from "./ActivityCard";
import { useApplications } from "../context/ApplicationContext";
import {
  usePermissions,
  QueueTab,
} from "../../shell/context/PermissionContext";

type SortOrder = "newest" | "oldest";

type FilterStatus = Extract<
  ApplicationStatus,
  "Approved" | "Declined" | "Completed"
>;

const FILTER_STATUSES: {
  label: string;
  value: FilterStatus;
  icon: "check-circle" | "x-circle" | "calendar";
}[] = [
  { label: "Approved", value: "Approved", icon: "check-circle" },
  { label: "Declined", value: "Declined", icon: "x-circle" },
  { label: "Completed", value: "Completed", icon: "calendar" },
];

const FILTER_CATEGORIES: {
  label: string;
  value: ApplicationCategory;
  icon: "book-open" | "file" | "award" | "star" | "message-circle";
}[] = [
  {
    label: "Exams",
    value: "Exams" as ApplicationCategory,
    icon: "book-open" as const,
  },
  {
    label: "Permits",
    value: "Permits" as ApplicationCategory,
    icon: "file" as const,
  },
  {
    label: "Licenses",
    value: "Licenses" as ApplicationCategory,
    icon: "award" as const,
  },
  {
    label: "Accreditations",
    value: "Accreditations" as ApplicationCategory,
    icon: "star" as const,
  },
  {
    label: "Certificates",
    value: "Certificates" as ApplicationCategory,
    icon: "award" as const,
  },
  {
    label: "Complaints and Request",
    value: "Complaints and Request" as ApplicationCategory,
    icon: "message-circle" as const,
  },
];

const TAB_LABELS: { key: QueueTab; label: string }[] = [
  { key: "activity", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "history", label: "History" },
];

interface DateGroup {
  label: string;
  dateKey: string;
  items: ApplicationData[];
}

function buildDateGroups(
  apps: ApplicationData[],
  sortOrder: SortOrder,
): DateGroup[] {
  const groupMap = new Map<
    string,
    { label: string; items: ApplicationData[]; ts: number }
  >();

  for (const app of apps) {
    const date = new Date(app.createdAt);
    const dateKey = date.toISOString().slice(0, 10);
    if (!groupMap.has(dateKey)) {
      groupMap.set(dateKey, {
        label: app.dateLabel,
        items: [],
        ts: date.getTime(),
      });
    }
    const group = groupMap.get(dateKey);
    if (group !== undefined) {
      group.items.push(app);
    }
  }

  const sorted = Array.from(groupMap.entries()).sort(([, a], [, b]) =>
    sortOrder === "newest" ? b.ts - a.ts : a.ts - b.ts,
  );

  return sorted.map(([dateKey, { label, items }]) => ({
    label,
    dateKey,
    items,
  }));
}

export function ActivitiesFeedPane() {
  const {
    applications,
    selectedId,
    setSelectedId,
    activeQueueTab,
    setActiveQueueTab,
    resetStore,
    isLoadingApi,
    apiError,
    mutateApiApplications,
  } = useApplications();
  const { visibleTabs } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());
  const [activeCategories, setActiveCategories] = useState<
    Set<ApplicationCategory>
  >(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleStatus = useCallback((status: string) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback((cat: ApplicationCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const toggleGroupCollapse = useCallback((dateKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSortOrder("newest");
    setActiveStatuses(new Set());
    setActiveCategories(new Set());
    setDateFrom("");
    setDateTo("");
    setShowSortDropdown(false);
    setShowDatePicker(false);
    setShowFilterPanel(false);
    resetStore();
  }, [resetStore]);

  const filteredGroups = useMemo(() => {
    let filtered = applications.filter((app) => {
      // 'activity' tab shows all applications, others are specific
      if (activeQueueTab !== "activity" && app.queueTab !== activeQueueTab)
        return false;

      if (
        searchQuery.trim().length > 0 &&
        !app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !app.permitTitle.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (activeStatuses.size > 0 && !activeStatuses.has(app.status))
        return false;
      if (activeCategories.size > 0 && !activeCategories.has(app.category))
        return false;
      if (dateFrom.length === 10) {
        const from = new Date(dateFrom);
        const appDate = new Date(app.createdAt);
        if (appDate < from) return false;
      }
      if (dateTo.length === 10) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const appDate = new Date(app.createdAt);
        if (appDate > to) return false;
      }
      return true;
    });

    return buildDateGroups(filtered, sortOrder);
  }, [
    applications,
    activeQueueTab,
    searchQuery,
    activeStatuses,
    activeCategories,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  const hasActiveFilters =
    activeStatuses.size > 0 ||
    activeCategories.size > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0;

  const visibleTabDefs = TAB_LABELS.filter((t) => visibleTabs.includes(t.key));

  return (
    <View style={styles.pane}>
      {/* ── Toolbar ── */}
      <View style={styles.toolbar}>
        <Text style={styles.feedTitle}>Feed</Text>
        <View style={styles.toolbarActions}>
          {/* Sort order */}
          <Pressable
            style={[styles.toolBtn, showSortDropdown && styles.toolBtnActive]}
            onPress={() => {
              setShowSortDropdown((p) => !p);
              setShowDatePicker(false);
              setShowFilterPanel(false);
            }}
          >
            <Lucide
              name="chevrons-down"
              size={16}
              color={showSortDropdown ? COLORS.brand[700] : COLORS.neutral[600]}
            />
          </Pressable>

          {/* Date range */}
          <Pressable
            style={[
              styles.toolBtn,
              showDatePicker && styles.toolBtnActive,
              dateFrom || dateTo ? styles.toolBtnFiltered : null,
            ]}
            onPress={() => {
              setShowDatePicker((p) => !p);
              setShowSortDropdown(false);
              setShowFilterPanel(false);
            }}
          >
            <Lucide
              name="calendar"
              size={16}
              color={showDatePicker ? COLORS.brand[700] : COLORS.neutral[600]}
            />
          </Pressable>

          {/* Filter */}
          <Pressable
            style={[
              styles.toolBtn,
              showFilterPanel && styles.toolBtnActive,
              hasActiveFilters ? styles.toolBtnFiltered : null,
            ]}
            onPress={() => {
              setShowFilterPanel((p) => !p);
              setShowSortDropdown(false);
              setShowDatePicker(false);
            }}
          >
            <Lucide
              name="sliders"
              size={16}
              color={showFilterPanel ? COLORS.brand[700] : COLORS.neutral[600]}
            />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </Pressable>

          {/* Refresh */}
          <Pressable style={styles.toolBtn} onPress={handleReset}>
            <Lucide name="refresh-cw" size={16} color={COLORS.neutral[600]} />
          </Pressable>
        </View>
      </View>

      {/* ── Sort Dropdown ── */}
      {showSortDropdown && (
        <View style={styles.inlinePanel}>
          <Pressable
            style={[
              styles.sortOption,
              sortOrder === "newest" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortOrder("newest");
              setShowSortDropdown(false);
            }}
          >
            <Lucide
              name="arrow-down"
              size={14}
              color={
                sortOrder === "newest" ? COLORS.brand[700] : COLORS.neutral[600]
              }
            />
            <Text
              style={[
                styles.sortOptionText,
                sortOrder === "newest" && styles.sortOptionTextActive,
              ]}
            >
              Newest First
            </Text>
            {sortOrder === "newest" && (
              <Lucide name="check" size={14} color={COLORS.brand[700]} />
            )}
          </Pressable>
          <Pressable
            style={[
              styles.sortOption,
              sortOrder === "oldest" && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortOrder("oldest");
              setShowSortDropdown(false);
            }}
          >
            <Lucide
              name="arrow-up"
              size={14}
              color={
                sortOrder === "oldest" ? COLORS.brand[700] : COLORS.neutral[600]
              }
            />
            <Text
              style={[
                styles.sortOptionText,
                sortOrder === "oldest" && styles.sortOptionTextActive,
              ]}
            >
              Oldest First
            </Text>
            {sortOrder === "oldest" && (
              <Lucide name="check" size={14} color={COLORS.brand[700]} />
            )}
          </Pressable>
        </View>
      )}

      {/* ── Date Range Picker ── */}
      {showDatePicker && (
        <View style={styles.inlinePanel}>
          <Text style={styles.datePickerTitle}>DATE RANGE FILTER</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>FROM</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.neutral[400]}
                value={dateFrom}
                onChangeText={setDateFrom}
                maxLength={10}
              />
            </View>
            <View style={styles.dateDivider}>
              <Lucide
                name="arrow-right"
                size={16}
                color={COLORS.neutral[400]}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>TO</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.neutral[400]}
                value={dateTo}
                onChangeText={setDateTo}
                maxLength={10}
              />
            </View>
          </View>
          <View style={styles.dateActions}>
            <Pressable
              style={styles.dateClearBtn}
              onPress={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              <Text style={styles.dateClearText}>Clear</Text>
            </Pressable>
            <Pressable
              style={styles.dateApplyBtn}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.dateApplyText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Filter Panel ── */}
      {showFilterPanel && (
        <View style={styles.inlinePanel}>
          <View style={styles.filterPanelHeader}>
            <Text style={styles.panelSectionTitle}>Sort By</Text>
            <Pressable onPress={() => setShowFilterPanel(false)}>
              <Lucide name="x" size={16} color={COLORS.neutral[500]} />
            </Pressable>
          </View>
          {FILTER_STATUSES.map((s) => (
            <View key={s.value} style={styles.filterRow}>
              <View style={styles.filterRowLeft}>
                <Lucide name={s.icon} size={15} color={COLORS.neutral[500]} />
                <Text style={styles.filterRowLabel}>{s.label}</Text>
              </View>
              <Switch
                value={activeStatuses.has(s.value)}
                onValueChange={() => toggleStatus(s.value)}
                trackColor={{
                  false: COLORS.neutral[200],
                  true: COLORS.brand[600],
                }}
                thumbColor={COLORS.neutral.white}
              />
            </View>
          ))}

          <View style={[styles.filterPanelHeader, { marginTop: SPACING[12] }]}>
            <Text style={styles.panelSectionTitle}>Filter By</Text>
          </View>
          {FILTER_CATEGORIES.map((c) => (
            <View key={c.value} style={styles.filterRow}>
              <View style={styles.filterRowLeft}>
                <Lucide name={c.icon} size={15} color={COLORS.neutral[500]} />
                <Text style={styles.filterRowLabel}>{c.label}</Text>
              </View>
              <Switch
                value={activeCategories.has(c.value)}
                onValueChange={() => toggleCategory(c.value)}
                trackColor={{
                  false: COLORS.neutral[200],
                  true: COLORS.brand[600],
                }}
                thumbColor={COLORS.neutral.white}
              />
            </View>
          ))}
        </View>
      )}

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <Lucide name="search" size={15} color={COLORS.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={COLORS.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Lucide name="x" size={14} color={COLORS.neutral[400]} />
          </Pressable>
        )}
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        {visibleTabDefs.map((tab) => {
          const isActive = activeQueueTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveQueueTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </Pressable>
          );
        })}
      </View>

      {/* ── Feed List ── */}
      {isLoadingApi ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={COLORS.brand[700]} />
          <Text style={styles.loadingText}>Loading applications…</Text>
        </View>
      ) : apiError !== undefined && apiError !== null ? (
        <View style={styles.errorState}>
          <Lucide name="wifi-off" size={28} color={COLORS.neutral[400]} />
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorSubtitle}>
            Could not connect to the server. Showing cached data.
          </Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => {
              void mutateApiApplications();
            }}
          >
            <Lucide name="refresh-cw" size={13} color={COLORS.brand[700]} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
      <ScrollView
        style={styles.feedScroll}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Lucide name="inbox" size={32} color={COLORS.neutral[300]} />
            <Text style={styles.emptyTitle}>No applications</Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? "Try clearing your filters."
                : "Nothing here yet."}
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.dateKey);
            return (
              <View key={group.dateKey}>
                {/* Date group accordion header */}
                <Pressable
                  style={styles.groupHeader}
                  onPress={() => toggleGroupCollapse(group.dateKey)}
                >
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  <Lucide
                    name={isCollapsed ? "chevron-down" : "chevron-up"}
                    size={16}
                    color={COLORS.neutral[500]}
                  />
                </Pressable>

                {/* Cards */}
                {!isCollapsed &&
                  group.items.map((app) => (
                    <ActivityCard
                      key={app.id}
                      application={app}
                      isActive={selectedId === app.id}
                      onPress={() => setSelectedId(app.id)}
                      onMenuAction={(action, id) => {
                        // Stub handlers — no backend logic
                        console.log(`[Menu] ${action} on ${id}`);
                      }}
                    />
                  ))}
              </View>
            );
          })
        )}

        {/* See more footer */}
        {filteredGroups.length > 0 && (
          <View style={styles.seeMoreRow}>
            <Text style={styles.seeMoreText}>
              Showing{" "}
              {
                applications.filter(
                  (a) =>
                    activeQueueTab === "activity" ||
                    a.queueTab === activeQueueTab,
                ).length
              }{" "}
              recent activities
            </Text>
            <Pressable style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>Load older activities</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: SPACING[32] }} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    flexDirection: "column",
    overflow: "hidden",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[16],
    paddingBottom: SPACING[12],
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  feedTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
  },
  toolbarActions: {
    flexDirection: "row",
    gap: SPACING[4],
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.input,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral[100],
    position: "relative",
  },
  toolBtnActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: COLORS.brand[600],
  },
  toolBtnFiltered: {
    backgroundColor: "#EFF6FF",
  },
  filterDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.brand[600],
    borderWidth: 1,
    borderColor: COLORS.neutral.white,
  },

  // Inline panels
  inlinePanel: {
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
  },
  panelSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING[8],
  },

  // Sort dropdown
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[8],
    borderRadius: RADIUS.input,
  } as unknown as object,
  sortOptionActive: {
    backgroundColor: "#EFF6FF",
  },
  sortOptionText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  sortOptionTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Date picker
  datePickerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
    marginBottom: SPACING[12],
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING[8],
    marginBottom: SPACING[12],
  },
  dateDivider: {
    paddingBottom: SPACING[12],
  },
  dateField: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    textTransform: "uppercase",
  },
  dateInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
  },
  dateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING[8],
  },
  dateClearBtn: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  dateClearText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  dateApplyBtn: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
  },
  dateApplyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },

  // Filter panel
  filterPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING[8],
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  filterRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  } as unknown as object,
  filterRowLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
  },

  // Search
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    margin: SPACING[12],
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.circle,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  } as unknown as object,
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
  },
  tabItem: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    position: "relative",
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[500],
  },
  tabTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: SPACING[16],
    right: SPACING[16],
    height: 2,
    backgroundColor: COLORS.brand[700],
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Feed scroll
  feedScroll: {
    flex: 1,
    paddingHorizontal: SPACING[12],
    paddingTop: SPACING[8],
  },

  // Date group accordion
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    marginBottom: SPACING[8],
  },
  groupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING[48],
    gap: SPACING[8],
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[400],
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[300],
  },

  // See more footer
  seeMoreRow: {
    padding: SPACING[20],
    alignItems: "center",
    gap: SPACING[12],
  },
  seeMoreText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: "center",
  },
  loadMoreBtn: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...SHADOWS.card,
  },
  loadMoreText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[12],
    paddingVertical: SPACING[48],
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
    paddingVertical: SPACING[48],
    paddingHorizontal: SPACING[24],
  },
  errorTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  errorSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    marginTop: SPACING[4],
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[16],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    backgroundColor: "#EFF6FF",
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
});
