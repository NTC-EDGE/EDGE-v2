import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  PageHeader,
  AnimatedCard,
  SearchBar,
  Button,
  Icon as Lucide,
  SkeletonLoader,
  EmptyState,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  AlertToast,
} from '@edge/ui';
import { useScheduleState, ScheduleStatusFilter } from '../hooks/useScheduleState';
import { ScheduleCard } from '../components/ScheduleCard';
import { ScheduleFormModal } from '../components/ScheduleFormModal';
import { ScheduleDetailModal } from '../components/ScheduleDetailModal';
import { DeleteScheduleModal } from '../components/DeleteScheduleModal';
import { ConfirmScheduleActionModal } from '../components/ConfirmScheduleActionModal';

export function ScheduleScreen() {
  const { colors, isDark } = useTheme();
  const state = useScheduleState();

  const filterOptions: Array<{ id: ScheduleStatusFilter; label: string; count?: number }> = [
    { id: 'ALL', label: 'All Schedules', count: state.stats.total },
    { id: 'PUBLISHED', label: 'Published', count: state.stats.publishedCount },
    { id: 'DRAFT', label: 'Drafts', count: state.stats.draftCount },
    { id: 'UPCOMING', label: 'Upcoming', count: state.stats.upcomingCount },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <PageHeader
          title="Operational & Examination Schedules"
          subtitle="Desktop Workstation • Manage examination dates, testing centers, filing periods, and portal publishing."
          action={
            <View style={styles.headerActions}>
              <Button
                variant="outline"
                leftIcon={<Lucide name="refresh-cw" size={13} color={colors.text} />}
                onPress={() => state.refetch()}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                leftIcon={<Lucide name="plus" size={14} color={COLORS.neutral.white} />}
                onPress={state.handleOpenCreate}
              >
                Create Schedule
              </Button>
            </View>
          }
        />

        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Schedules */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
                <Lucide name="calendar" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
              </View>
              <Text style={[styles.statTag, { color: colors.textMuted }]}>Overview</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Schedules</Text>
          </AnimatedCard>

          {/* Published */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : COLORS.semantic.successBg }]}>
                <Lucide name="globe" size={18} color={COLORS.semantic.success} />
              </View>
              <Text style={[styles.statTag, { color: COLORS.semantic.successText }]}>Portal Live</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.semantic.success }]}>
              {state.stats.publishedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Published Sessions</Text>
          </AnimatedCard>

          {/* Upcoming */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
                <Lucide name="clock" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
              </View>
              <Text style={[styles.statTag, { color: colors.textMuted }]}>Upcoming</Text>
            </View>
            <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
              {state.stats.upcomingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Upcoming Dates</Text>
          </AnimatedCard>

          {/* Total Slots Capacity */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : COLORS.semantic.infoBg }]}>
                <Lucide name="users" size={18} color={isDark ? colors.brand[500] : COLORS.semantic.infoText} />
              </View>
              <Text style={[styles.statTag, { color: isDark ? colors.neutral[400] : COLORS.semantic.infoText }]}>Capacity</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.totalSlots}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Candidate Slots</Text>
          </AnimatedCard>
        </View>

        {/* Search and Filters Toolbar */}
        <View style={[styles.controlsRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.searchBox}>
            <SearchBar
              value={state.searchQuery}
              onChangeText={state.setSearchQuery}
              placeholder="Search schedules by venue, service title, code, or remarks..."
            />
          </View>

          <View style={styles.filterPills}>
            {filterOptions.map((opt) => {
              const isActive = state.statusFilter === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.pill,
                    { borderColor: colors.border },
                    isActive && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => state.setStatusFilter(opt.id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                    ]}
                  >
                    {opt.label}
                    {opt.count !== undefined && ` (${opt.count})`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Loading State */}
        {state.isLoading && (
          <View style={styles.loadingGrid}>
            <SkeletonLoader variant="rectangular" width="100%" height={140} borderRadius={RADIUS.card} />
            <SkeletonLoader variant="rectangular" width="100%" height={140} borderRadius={RADIUS.card} />
            <SkeletonLoader variant="rectangular" width="100%" height={140} borderRadius={RADIUS.card} />
          </View>
        )}

        {/* Empty State */}
        {!state.isLoading && state.paginatedSchedules.length === 0 && (
          <EmptyState
            icon="calendar"
            title="No Examination Schedules Found"
            description="No schedules match your search filters or active criteria. You can create a new schedule to get started."
            actionLabel="Create Schedule"
            onActionPress={state.handleOpenCreate}
          />
        )}

        {/* Schedule Cards Grid */}
        {!state.isLoading && state.paginatedSchedules.length > 0 && (
          <View style={styles.cardsGrid}>
            {state.paginatedSchedules.map((schedule, idx) => (
              <View key={schedule.id} style={styles.gridItem}>
                <ScheduleCard
                  schedule={schedule}
                  index={idx}
                  onEdit={state.handleOpenEdit}
                  onTogglePublish={state.handleTogglePublish}
                  onDelete={(item) => state.setDeleteModal({ visible: true, item })}
                  onViewDetails={state.handleOpenDetail}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Glassmorphic Pagination Pill */}
      {state.totalPages > 1 && (
        <View style={styles.floatingPaginationOverlay} pointerEvents="box-none">
          <View
            style={[
              styles.paginationGlassPill,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <Pressable
              style={[
                styles.pageBtn,
                { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border, backgroundColor: isDark ? colors.neutral[800] : colors.cardBg },
                state.currentPage === 1 && styles.pageBtnDisabled,
                Platform.select({ web: { cursor: state.currentPage === 1 ? 'not-allowed' : 'pointer' } as object }),
              ]}
              disabled={state.currentPage === 1}
              onPress={() => state.setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <Lucide name="chevron-left" size={14} color={state.currentPage === 1 ? colors.textMuted : colors.text} />
              <Text style={[styles.pageBtnText, { color: state.currentPage === 1 ? colors.textMuted : colors.text }]}>
                Previous
              </Text>
            </Pressable>

            <View style={[styles.pageInfoBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Text style={[styles.paginationInfo, { color: colors.text }]}>
                Page <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{state.currentPage}</Text> of {state.totalPages}
              </Text>
            </View>

            <Pressable
              style={[
                styles.pageBtn,
                { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border, backgroundColor: isDark ? colors.neutral[800] : colors.cardBg },
                state.currentPage === state.totalPages && styles.pageBtnDisabled,
                Platform.select({ web: { cursor: state.currentPage === state.totalPages ? 'not-allowed' : 'pointer' } as object }),
              ]}
              disabled={state.currentPage === state.totalPages}
              onPress={() => state.setCurrentPage((p) => Math.min(state.totalPages, p + 1))}
            >
              <Text style={[styles.pageBtnText, { color: state.currentPage === state.totalPages ? colors.textMuted : colors.text }]}>
                Next
              </Text>
              <Lucide name="chevron-right" size={14} color={state.currentPage === state.totalPages ? colors.textMuted : colors.text} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Modals */}
      <ScheduleFormModal
        visible={state.isFormModalOpen}
        schedule={state.editingSchedule}
        defaultTenantId={state.currentTenantId}
        onClose={() => state.setIsFormModalOpen(false)}
        onSave={state.handleSaveSchedule}
      />

      <ScheduleDetailModal
        schedule={state.viewingSchedule}
        onClose={() => state.setViewingSchedule(null)}
        onEdit={state.handleOpenEdit}
      />

      <DeleteScheduleModal
        visible={state.deleteModal.visible}
        schedule={state.deleteModal.item}
        onClose={() => state.setDeleteModal({ visible: false, item: null })}
        onConfirm={state.handleDeleteConfirm}
      />

      <ConfirmScheduleActionModal
        visible={state.confirmModal.visible}
        type={state.confirmModal.type}
        schedule={state.confirmModal.schedule}
        pendingFormData={state.confirmModal.pendingFormData}
        onClose={() =>
          state.setConfirmModal({
            visible: false,
            type: 'update',
            schedule: null,
            pendingFormData: null,
          })
        }
        onConfirm={state.handleConfirmAction}
      />

      {state.toast !== null && (
        <View style={styles.toastContainer}>
          <AlertToast
            message={state.toast.message}
            variant={state.toast.variant}
            onDismiss={state.hideToast}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: SPACING[20],
    right: SPACING[24],
    zIndex: 999999,
    maxWidth: 420,
  },
  container: {
    padding: SPACING[24],
    paddingBottom: 90,
    gap: SPACING[16],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[6],
    ...SHADOWS.card,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTag: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  controlsRow: {
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
  },
  searchBox: {
    flex: 1,
  },
  filterPills: {
    flexDirection: 'row',
    gap: SPACING[6],
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  loadingGrid: {
    gap: SPACING[12],
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
    overflow: 'visible',
    position: 'relative',
  },
  gridItem: {
    flex: 1,
    minWidth: 340,
    overflow: 'visible',
    position: 'relative',
  },
  floatingPaginationOverlay: {
    position: 'absolute',
    bottom: SPACING[16],
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[10],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    ...SHADOWS.modal,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    }),
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  pageInfoBadge: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.sm,
  },
  paginationInfo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
});
