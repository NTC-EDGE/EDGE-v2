import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Platform, LayoutAnimation, UIManager, Animated } from 'react-native';
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
} from '@edge/ui';
import { useFeedbackState, RatingFilterType } from '../hooks/useFeedbackState';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function AnimatedFeedbackDrawer({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) {
  const anim = React.useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, anim]);

  const maxHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const opacity = anim;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <Animated.View
      style={{
        maxHeight,
        opacity,
        overflow: 'hidden',
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function FeedbackScreen() {
  const { colors, isDark } = useTheme();
  const state = useFeedbackState();

  const handleToggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    state.toggleExpand(id);
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <Lucide
          key={i}
          name="star"
          size={13}
          color={isFilled ? COLORS.semantic.warning : (isDark ? colors.neutral[700] : colors.neutral[300])}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const maskName = (name: string) => {
    if (!name) return 'W****E';
    const parts = name.trim().split(' ');
    return parts
      .map((part) => {
        if (part.length <= 2) return `${part[0] ?? ''}*`;
        return `${part[0]}${'*'.repeat(Math.max(3, part.length - 2))}${part[part.length - 1]}`;
      })
      .join(' ');
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'c****t@domain.com';
    const [local, domain] = email.split('@');
    const maskedLocal = maskName(local);
    return `${maskedLocal}@${domain}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (name[0] ?? 'U').toUpperCase();
  };

  const filterOptions: Array<{ id: RatingFilterType; label: string; count?: number }> = [
    { id: 'all', label: 'All Submissions', count: state.stats.total },
    { id: '5', label: '5 Stars ★' },
    { id: '4', label: '4+ Stars' },
    { id: 'anon', label: 'Anonymous Only', count: state.stats.anonCount },
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
        title="User Feedbacks & Suggestions"
        subtitle="Desktop Workstation • Client feedback sentiment analysis, public reviews, and submission tracking."
        action={
          <View style={styles.headerActions}>
            <Button
              variant="outline"
              leftIcon={<Lucide name="refresh-cw" size={13} color={colors.text} />}
              onPress={() => state.refetch()}
            >
              Refresh
            </Button>
          </View>
        }
      />

      {/* KPI Stats Cards */}
      <View style={styles.statsGrid}>
        <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
              <Lucide name="message-square" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
            </View>
            <Text style={[styles.statTag, { color: colors.textMuted }]}>Total</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Submissions</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : COLORS.semantic.warningBg }]}>
              <Lucide name="star" size={18} color={COLORS.semantic.warning} />
            </View>
            <Text style={[styles.statTag, { color: COLORS.semantic.warningText }]}>Satisfaction</Text>
          </View>
          <View style={styles.ratingValueRow}>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.avgRating}</Text>
            <Text style={styles.ratingStarSuffix}>★</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Average Customer Score</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
              <Lucide name="user-x" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
            </View>
            <Text style={[styles.statTag, { color: colors.textMuted }]}>Privacy</Text>
          </View>
          <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
            {state.stats.anonCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Anonymous Feedback</Text>
        </AnimatedCard>

        <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : COLORS.semantic.infoBg }]}>
              <Lucide name="clock" size={18} color={isDark ? colors.brand[500] : COLORS.semantic.infoText} />
            </View>
            <Text style={[styles.statTag, { color: isDark ? colors.neutral[400] : COLORS.semantic.infoText }]}>Queue</Text>
          </View>
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
            placeholder="Search feedback content, sender, email, or keywords..."
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
                  isActive && {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => state.setRatingFilter(opt.id)}
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

      {/* Content Area */}
      {state.isLoading && (
        <View style={styles.loadingStack}>
          <SkeletonLoader variant="rectangular" width="100%" height={90} borderRadius={8} />
          <SkeletonLoader variant="rectangular" width="100%" height={90} borderRadius={8} />
          <SkeletonLoader variant="rectangular" width="100%" height={90} borderRadius={8} />
        </View>
      )}

      {!state.isLoading && state.paginatedFeedback.length === 0 && (
        <EmptyState
          icon="message-square"
          title="No Feedback Records Found"
          description="No user feedback entries match your current search and filter criteria."
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
          const displayName = item.isAnonymous ? maskName(item.senderName || 'Wilhelm E') : item.senderName;
          const displayEmail = item.isAnonymous ? maskEmail(item.senderEmail || 'client@ntc.gov.ph') : item.senderEmail;
          const initials = getInitials(displayName);

          return (
            <AnimatedCard
              key={item.id}
              delay={index * 30}
              style={[
                styles.feedbackCard,
                { backgroundColor: colors.cardBg, borderColor: colors.border },
              ]}
            >
              {/* Card Header: Avatar + Masked/Sender Info + Rating & Delete */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarGroup}>
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: item.isAnonymous
                          ? (isDark ? colors.neutral[800] : colors.neutral[200])
                          : (isDark ? colors.brand[900] : colors.brand.light),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        {
                          color: item.isAnonymous
                            ? colors.textMuted
                            : (isDark ? colors.brand[500] : colors.brand.primary),
                        },
                      ]}
                    >
                      {initials}
                    </Text>
                  </View>

                  <View style={styles.senderInfo}>
                    <Text style={[styles.senderName, { color: colors.text }]}>
                      {displayName}
                    </Text>
                    {displayEmail ? (
                      <Text style={[styles.senderEmail, { color: colors.textMuted }]}>{displayEmail}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Rating Stars & Delete Action */}
                <View style={styles.headerRight}>
                  <View style={styles.ratingBadge}>
                    {renderRatingStars(item.rating)}
                    <Text style={[styles.ratingScoreText, { color: colors.text }]}>{item.rating}.0</Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteIconBtn,
                      pressed && { opacity: 0.7 },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() =>
                      state.setDeleteModal({
                        visible: true,
                        id: item.id,
                        sender: displayName,
                      })
                    }
                  >
                    <Lucide name="trash-2" size={15} color={COLORS.semantic.error} />
                  </Pressable>
                </View>
              </View>

              {/* Subject & Message Content */}
              <View style={styles.cardBody}>
                <Text style={[styles.feedbackSubject, { color: colors.text }]}>{item.subject}</Text>

                <Text
                  style={[styles.feedbackMessage, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {item.message}
                </Text>

                <AnimatedFeedbackDrawer isExpanded={isExpanded}>
                  <View style={[styles.expandedDrawer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
                    <View style={styles.expandedMetaRow}>
                      <View style={styles.expandedMetaItem}>
                        <Text style={[styles.expandedMetaLabel, { color: colors.textMuted }]}>FEEDBACK CATEGORY</Text>
                        <Text style={[styles.expandedMetaValue, { color: colors.text }]}>Regional Service & Portal UX</Text>
                      </View>
                      <View style={styles.expandedMetaItem}>
                        <Text style={[styles.expandedMetaLabel, { color: colors.textMuted }]}>REVIEW STATUS</Text>
                        <Text style={[styles.expandedMetaValue, { color: item.status === 'Pending' ? COLORS.semantic.warning : COLORS.semantic.success }]}>
                          {item.status || 'Reviewed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </AnimatedFeedbackDrawer>
              </View>

              {/* Footer: Long Date & Working Expand Button */}
              <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <View style={styles.dateMetaRow}>
                  <Lucide name="calendar" size={13} color={colors.textMuted} />
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    Submitted on {formatDate(item.createdAt)}
                  </Text>
                </View>

                <Pressable
                  style={Platform.select({ web: { cursor: 'pointer' } })}
                  onPress={() => handleToggleExpand(item.id)}
                >
                  <Text style={[styles.expandText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    {isExpanded ? 'Collapse ▲' : 'Read full feedback ▼'}
                  </Text>
                </Pressable>
              </View>
            </AnimatedCard>
          );
        })}

      </ScrollView>

      {/* ── Sticky Floating Glassmorphism Pagination Bar ── */}
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

      {/* Delete Modal */}
      <DeleteAdminItemModal
        visible={state.deleteModal.visible}
        itemTitle={state.deleteModal.sender}
        itemType="User Feedback Record"
        onClose={() => state.setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={state.handleDeleteConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[24],
    paddingBottom: 80,
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
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ratingStarSuffix: {
    fontSize: 16,
    color: COLORS.semantic.warning,
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
  loadingStack: {
    gap: SPACING[12],
  },
  feedbackCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  senderInfo: {
    flex: 1,
  },
  senderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  senderName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  senderEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScoreText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  deleteIconBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  cardBody: {
    gap: 4,
  },
  feedbackSubject: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  feedbackMessage: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    lineHeight: 19,
  },
  expandedDrawer: {
    marginTop: SPACING[8],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  expandedMetaRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  expandedMetaItem: {
    gap: 2,
  },
  expandedMetaLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  expandedMetaValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[8],
    borderTopWidth: 1,
  },
  dateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  expandText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
