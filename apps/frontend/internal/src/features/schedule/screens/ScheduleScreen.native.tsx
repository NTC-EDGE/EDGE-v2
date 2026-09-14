import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
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
    { id: 'ALL', label: 'All', count: state.stats.total },
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
          title="Schedules"
          subtitle="Operational & Exam Timelines"
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Lucide name="plus" size={14} color={COLORS.neutral.white} />}
              onPress={state.handleOpenCreate}
            >
              Add
            </Button>
          }
        />

        {/* Mobile Stats Scroll / Grid */}
        <View style={styles.statsRow}>
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.total}</Text>
          </AnimatedCard>

          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: COLORS.semantic.successText }]}>Published</Text>
            <Text style={[styles.statValue, { color: COLORS.semantic.success }]}>
              {state.stats.publishedCount}
            </Text>
          </AnimatedCard>

          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>Upcoming</Text>
            <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
              {state.stats.upcomingCount}
            </Text>
          </AnimatedCard>
        </View>

        {/* Search Input */}
        <SearchBar
          value={state.searchQuery}
          onChangeText={state.setSearchQuery}
          placeholder="Search schedules..."
        />

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
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
        </ScrollView>

        {/* Loading State */}
        {state.isLoading && (
          <View style={styles.loadingGrid}>
            <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={RADIUS.card} />
            <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={RADIUS.card} />
          </View>
        )}

        {/* Empty State */}
        {!state.isLoading && state.paginatedSchedules.length === 0 && (
          <EmptyState
            icon="calendar"
            title="No Schedules Found"
            description="No examination schedules match your active filters."
            actionLabel="Create Schedule"
            onActionPress={state.handleOpenCreate}
          />
        )}

        {/* Schedule Cards List */}
        {!state.isLoading && state.paginatedSchedules.length > 0 && (
          <View style={styles.cardsList}>
            {state.paginatedSchedules.map((schedule, idx) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                index={idx}
                onEdit={state.handleOpenEdit}
                onTogglePublish={state.handleTogglePublish}
                onDelete={(item) => state.setDeleteModal({ visible: true, item })}
                onViewDetails={state.handleOpenDetail}
              />
            ))}
          </View>
        )}
      </ScrollView>

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
    top: SPACING[16],
    left: SPACING[16],
    right: SPACING[16],
    zIndex: 999999,
  },
  container: {
    padding: SPACING[16],
    paddingBottom: 40,
    gap: SPACING[16],
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[8],
  },
  statCard: {
    flex: 1,
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 2,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  filterScroll: {
    gap: SPACING[6],
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  loadingGrid: {
    gap: SPACING[10],
  },
  cardsList: {
    gap: SPACING[12],
    overflow: 'visible',
    position: 'relative',
  },
});
