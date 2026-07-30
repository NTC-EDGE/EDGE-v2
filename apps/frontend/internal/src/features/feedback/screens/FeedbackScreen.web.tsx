import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS, useTheme, PageHeader, AnimatedCard, SearchBar, Button, Icon as Lucide, SkeletonLoader, EmptyState, SPACING, RADIUS, TYPOGRAPHY } from '@edge/ui';
import { useFeedbackState, RatingFilterType } from '../hooks/useFeedbackState';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';

export function FeedbackScreen() {
  const { colors, isDark } = useTheme();
  const state = useFeedbackState();

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Lucide
          key={i}
          name="star"
          size={14}
          color={i <= rating ? COLORS.semantic.warning : COLORS.neutral[300]}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const filterOptions: Array<{ id: RatingFilterType; label: string }> = [
    { id: 'all', label: 'All Feedbacks' },
    { id: '5', label: '5 Stars ★' },
    { id: '4', label: '4+ Stars' },
    { id: 'anon', label: 'Anonymous Only' },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
    >
      <PageHeader
        title="User Feedbacks & Suggestions"
        subtitle="Central repository of public and anonymous feedback submissions submitted by clients."
        action={
          <Button
            variant="outline"
            leftIcon={<Lucide name="refresh-cw" size={14} color={colors.text} />}
            onPress={() => state.refetch()}
          >
            Refresh
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <AnimatedCard style={{ ...styles.statCard, backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Feedbacks</Text>
        </AnimatedCard>

        <AnimatedCard style={{ ...styles.statCard, backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text style={[styles.statValue, { color: COLORS.semantic.warning }]}>{state.stats.avgRating} ★</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average Rating</Text>
        </AnimatedCard>

        <AnimatedCard style={{ ...styles.statCard, backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text style={[styles.statValue, { color: COLORS.brand.accent }]}>{state.stats.anonCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Anonymous Entries</Text>
        </AnimatedCard>

        <AnimatedCard style={{ ...styles.statCard, backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text style={[styles.statValue, { color: COLORS.semantic.success }]}>{state.stats.pendingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending Review</Text>
        </AnimatedCard>
      </View>

      {/* Controls Bar */}
      <View style={[styles.controlsRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.searchBox}>
          <SearchBar
            value={state.searchQuery}
            onChangeText={state.setSearchQuery}
            placeholder="Search feedback sender, subject, or keywords..."
          />
        </View>

        <View style={styles.filterPills}>
          {filterOptions.map((opt) => {
            const isActive = state.ratingFilter === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  isActive && { backgroundColor: isDark ? colors.cardBg : colors.brand.light, borderColor: colors.brand.primary },
                ]}
                onPress={() => state.setRatingFilter(opt.id)}
              >
                <Text style={[styles.pillText, { color: isActive ? colors.brand.primary : colors.textMuted }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      {state.isLoading && (
        <View style={styles.loadingStack}>
          <SkeletonLoader variant="rectangular" width="100%" height={80} borderRadius={8} />
          <SkeletonLoader variant="rectangular" width="100%" height={80} borderRadius={8} />
          <SkeletonLoader variant="rectangular" width="100%" height={80} borderRadius={8} />
        </View>
      )}

      {!state.isLoading && state.paginatedFeedback.length === 0 && (
        <EmptyState
          icon="message-square"
          title="No Feedbacks Found"
          description="No feedback records match your current search and filter criteria."
          actionLabel="Clear Filters"
          onActionPress={() => {
            state.setSearchQuery('');
            state.setRatingFilter('all');
          }}
        />
      )}

      {!state.isLoading &&
        state.paginatedFeedback.map((item, index) => {
          const isExpanded = state.expandedId === item.id;
          return (
              <AnimatedCard
                key={item.id}
                delay={index * 40}
                style={{ ...styles.feedbackCard, backgroundColor: colors.cardBg, borderColor: colors.border }}
                onPress={() => state.toggleExpand(item.id)}
              >
              <View style={styles.cardHeader}>
                <View style={styles.senderInfo}>
                  <Text style={[styles.senderName, { color: colors.text }]}>
                    {item.isAnonymous ? 'Anonymous Sender' : item.senderName}
                  </Text>
                  {!item.isAnonymous && (
                    <Text style={[styles.senderEmail, { color: colors.textMuted }]}>{item.senderEmail}</Text>
                  )}
                </View>

                <View style={styles.headerRight}>
                  {renderRatingStars(item.rating)}
                  <Pressable
                    style={styles.deleteIconBtn}
                    onPress={() =>
                      state.setDeleteModal({
                        visible: true,
                        id: item.id,
                        sender: item.isAnonymous ? 'Anonymous' : item.senderName,
                      })
                    }
                  >
                    <Lucide name="trash-2" size={16} color={COLORS.semantic.error} />
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.feedbackSubject, { color: colors.text }]}>{item.subject}</Text>

              <Text
                style={[styles.feedbackMessage, { color: colors.textMuted }]}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.message}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  Submitted on {item.createdAt}
                </Text>
                <Text style={styles.expandText}>
                  {isExpanded ? 'Collapse ▲' : 'Read full feedback ▼'}
                </Text>
              </View>
            </AnimatedCard>
          );
        })}

      <DeleteAdminItemModal
        visible={state.deleteModal.visible}
        itemTitle={state.deleteModal.sender}
        itemType="User Feedback Record"
        onClose={() => state.setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={state.handleDeleteConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[16],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: SPACING[16],
  },
  statValue: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  controlsRow: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  searchBox: {
    flex: 1,
  },
  filterPills: {
    flexDirection: 'row',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingStack: {
    gap: SPACING[12],
  },
  feedbackCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  senderEmail: {
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIconBtn: {
    padding: 4,
  },
  feedbackSubject: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  feedbackMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
  },
  expandText: {
    fontSize: 12,
    color: COLORS.brand.accent,
    fontWeight: '600',
  },
});
