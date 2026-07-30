import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
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
    { id: 'all', label: 'All' },
    { id: '5', label: '5★' },
    { id: '4', label: '4★+' },
    { id: 'anon', label: 'Anon' },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="User Feedbacks"
          subtitle="Mobile Admin • Client submissions"
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Lucide name="refresh-cw" size={12} color={colors.text} />}
              onPress={() => state.refetch()}
            >
              Refresh
            </Button>
          }
        />

        {/* Mobile Search & Filters */}
        <AnimatedCard style={[styles.controlsRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SearchBar
            value={state.searchQuery}
            onChangeText={state.setSearchQuery}
            placeholder="Search feedback..."
          />

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
        </AnimatedCard>

        {/* Content Area */}
        {state.isLoading && (
          <View style={styles.loadingStack}>
            <SkeletonLoader variant="rectangular" width="100%" height={80} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={80} borderRadius={8} />
          </View>
        )}

        {!state.isLoading && state.paginatedFeedback.length === 0 && (
          <EmptyState
            icon="message-square"
            title="No Feedbacks"
            description="No feedback records match your filters."
            actionLabel="Reset"
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
                style={[styles.feedbackCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => state.toggleExpand(item.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.senderInfo}>
                    <Text style={[styles.senderName, { color: colors.text }]}>
                      {item.isAnonymous ? 'Anonymous' : item.senderName}
                    </Text>
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
                      <Lucide name="trash-2" size={14} color={colors.semantic.error} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[16],
    gap: SPACING[12],
  },
  controlsRow: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingStack: {
    gap: SPACING[8],
  },
  feedbackCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
  },
  deleteIconBtn: {
    padding: 2,
  },
  feedbackSubject: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
});
