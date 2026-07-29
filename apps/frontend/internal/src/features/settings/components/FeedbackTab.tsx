import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { useAdminFeedback, FeedbackDto } from '@edge/api';
import { FeedbackItem } from '../data/mockAdminSettings';

interface FeedbackTabProps {
  feedback?: FeedbackItem[];
  onDeleteFeedback?: (id: string, subject: string) => void;
}

export function FeedbackTab({ onDeleteFeedback }: FeedbackTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { feedback: apiFeedback, isLoading, isError, refetch } = useAdminFeedback();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFeedback = useMemo(() => {
    if (searchQuery.trim() === '') return apiFeedback;
    const lower = searchQuery.toLowerCase();
    return apiFeedback.filter(
      (item) =>
        item.senderName.toLowerCase().includes(lower) ||
        item.senderEmail.toLowerCase().includes(lower) ||
        item.subject.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower)
    );
  }, [apiFeedback, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Lucide
          key={i}
          name="star"
          size={14}
          color={i <= rating ? '#F59E0B' : '#CBD5E1'}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Control Toolbar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Feedbacks..."
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Lucide name="x" size={16} color={COLORS.neutral[400]} />
            </Pressable>
          )}
        </View>

        {/* Refresh & Filter Controls */}
        <View style={styles.filterControlsRow}>
          <Pressable style={styles.filterBtn} onPress={() => refetch()}>
            <Lucide name="refresh-cw" size={15} color="#4F46E5" />
            <Text style={styles.filterBtnText}>Refresh</Text>
          </Pressable>
        </View>
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Loading feedback submissions from API...</Text>
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.centeredState}>
          <Lucide name="alert-triangle" size={32} color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Failed to load feedback from server.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Feedback Accordion Cards List */}
      {!isLoading && !isError && (
        <View style={styles.listContainer}>
          {filteredFeedback.length === 0 ? (
            <View style={[styles.emptyCard, SHADOWS.card]}>
              <Lucide name="message-square" size={36} color={COLORS.neutral[400]} />
              <Text style={styles.emptyTitle}>No feedback entries found</Text>
              <Text style={styles.emptySubtitle}>No customer feedback submissions recorded in the database yet.</Text>
            </View>
          ) : (
            filteredFeedback.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <View key={item.id} style={[styles.card, SHADOWS.card]}>
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.senderWrapper}>
                      <Text style={styles.senderName}>{item.senderName}</Text>

                      <View style={styles.subtextRow}>
                        <View style={styles.emailRow}>
                          <Lucide name="mail" size={14} color="#94A3B8" />
                          <Text style={styles.senderEmail}>{item.senderEmail}</Text>
                        </View>

                        <Text style={styles.separatorDot}>·</Text>
                        {renderRatingStars(item.rating)}

                        <Text style={styles.separatorDot}>·</Text>
                        <View style={styles.badgePurple}>
                          <Text style={styles.badgeTextPurple}>{item.subject || 'Feedback'}</Text>
                        </View>

                        <View style={styles.badgeDate}>
                          <Text style={styles.badgeDateText}>
                            DATE: {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.headerRight}>
                      {onDeleteFeedback && (
                        <Pressable
                          style={[styles.actionBtn, styles.deleteBtn]}
                          onPress={() => onDeleteFeedback(item.id, item.senderName)}
                        >
                          <Lucide name="trash-2" size={15} color="#EF4444" />
                        </Pressable>
                      )}

                      <View style={styles.verticalDivider} />

                      <Pressable
                        style={styles.expandBtn}
                        onPress={() => toggleExpand(item.id)}
                      >
                        <Lucide
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={COLORS.neutral[600]}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.expandedHeaderLeft}>
                        <Lucide name="message-square" size={16} color="#6366F1" />
                        <Text style={styles.expandedHeaderText}>FEEDBACK MESSAGE</Text>
                      </View>

                      <View style={styles.messageBox}>
                        <Text style={styles.messageText}>
                          {item.message || 'No comment provided.'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Footer Pagination Bar */}
      {!isLoading && !isError && (
        <View style={[styles.paginationBar, isMobile && styles.paginationBarMobile]}>
          <Text style={styles.paginationShowing}>
            Showing {filteredFeedback.length} of {apiFeedback.length} entries
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    paddingBottom: SPACING[32],
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  controlBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: RADIUS.input,
  },
  filterBtnText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#4F46E5',
  },
  listContainer: {
    gap: SPACING[12],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  senderWrapper: {
    flex: 1,
    minWidth: 280,
  },
  senderName: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
    marginTop: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderEmail: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  separatorDot: {
    color: COLORS.neutral[400],
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePurple: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeTextPurple: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#4F46E5',
  },
  badgeDate: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeDateText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: SPACING[4],
  },
  expandBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: '#F8FAFC',
    padding: SPACING[16],
    gap: SPACING[12],
  },
  expandedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedHeaderText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  messageBox: {
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING[16],
  },
  messageText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 20,
  },
  centeredState: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  retryButton: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.button,
  },
  retryText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[4],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[700],
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[12],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  paginationBarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  paginationShowing: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
});
