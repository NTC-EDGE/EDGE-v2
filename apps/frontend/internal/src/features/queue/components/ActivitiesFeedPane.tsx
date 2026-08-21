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
  Platform,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
  useTheme,
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationStatus,
  ApplicationCategory,
} from "../../../types/application";
import { ActivityCard } from "./ActivityCard";
import { useAdminApplications, applicationService } from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import {
  usePermissions,
  QueueTab,
} from "../../shell/context/PermissionContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOrder = "newest" | "oldest";

type FilterStatus = Extract<
  ApplicationStatus,
  "Approved" | "Returned" | "Completed"
>;

// ─── Static config ───────────────────────────────────────────────────────────

const FILTER_STATUSES: {
  label: string;
  value: FilterStatus;
  icon: "check-circle" | "x-circle" | "calendar";
}[] = [
  { label: "Approved", value: "Approved", icon: "check-circle" },
  { label: "Returned", value: "Returned", icon: "x-circle" },
  { label: "Completed", value: "Completed", icon: "calendar" },
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
  { key: "history",  label: "History" },
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
  const groupMap = new Map<
    string,
    { label: string; items: ApplicationData[]; ts: number }
  >();

  for (const app of apps) {
    const date = new Date(app.createdAt);
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

  return sorted.map(([dateKey, { label, items }]) => ({ label, dateKey, items }));
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

  const { applications: rawDtos, isLoading, refetch } = useAdminApplications({
    queueTab: activeQueueTab,
    scope: "queue",
  });

  const applications = useMemo(() => {
    if (!Array.isArray(rawDtos)) return [];
    return rawDtos.map(mapApplicationDtoToUI);
  }, [rawDtos]);

  const togglePinApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    await applicationService.togglePin(id, !app?.isPinned);
    refetch();
  }, [applications, refetch]);

  const toggleArchiveApplication = useCallback(async (id: string) => {
    const app = applications.find((a) => a.id === id);
    await applicationService.toggleArchive(id, !app?.isArchived);
    if (selectedId === id) setSelectedId?.(null);
    refetch();
  }, [applications, selectedId, setSelectedId, refetch]);

  const evaluateApplication = useCallback(async (id: string) => {
    await applicationService.updateStatus(id, { status: "Evaluating" });
    refetch();
  }, [refetch]);

  const resetStore = useCallback(() => {
    refetch();
  }, [refetch]);

  const [searchQuery,       setSearchQuery]       = useState("");
  const [sortOrder,         setSortOrder]         = useState<SortOrder>("newest");
  const [activeStatuses,    setActiveStatuses]    = useState<Set<string>>(new Set());
  const [activeCategories,  setActiveCategories]  = useState<Set<ApplicationCategory>>(new Set());
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

  const toggleGroupCollapse = useCallback((dateKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey); else next.add(dateKey);
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

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    const filtered = applications.filter((app) => {
      if (app.status === "Draft" || app.isArchived) return false;
      if (activeQueueTab !== "activity" && app.queueTab !== activeQueueTab) return false;
      if (
        searchQuery.trim().length > 0 &&
        !app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !app.permitTitle.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(app.status))   return false;
      if (activeCategories.size > 0 && !activeCategories.has(app.category)) return false;
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
  }, [applications, activeQueueTab, searchQuery, activeStatuses, activeCategories, dateFrom, dateTo, sortOrder]);

  const hasActiveFilters =
    activeStatuses.size > 0 ||
    activeCategories.size > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0;

  const visibleTabDefs = TAB_LABELS.filter((t) => visibleTabs.includes(t.key));

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
                <Text style={[styles.dateLabel, { color: textMuted }]}>{label.toUpperCase()}</Text>
                <TextInput
                  style={[styles.dateInput, { color: text, backgroundColor: inputBg, borderColor: border }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={textMuted}
                  value={i === 0 ? dateFrom : dateTo}
                  onChangeText={i === 0 ? setDateFrom : setDateTo}
                  maxLength={10}
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
          placeholder="Search applications…"
          placeholderTextColor={textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
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
                      onMenuAction={(action, id) => {
                        if (action === "evaluate") {
                          void evaluateApplication(id);
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
              Showing{" "}
              {applications.filter((a) => activeQueueTab === "activity" || a.queueTab === activeQueueTab).length}{" "}
              activities
            </Text>
            <Pressable style={[styles.loadMoreBtn, { backgroundColor: surface, borderColor: border }]}>
              <Text style={[styles.loadMoreText, { color: brandColor }]}>Load older activities</Text>
            </Pressable>
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
});
