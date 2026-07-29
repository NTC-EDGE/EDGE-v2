import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { useAdminFeedback, apiClient } from '@edge/api';
import { DeleteAdminItemModal } from '../../settings/components/DeleteAdminItemModal';

export function FeedbackScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { feedback, isLoading, isError, refetch } = useAdminFeedback();

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'anon'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    id: string;
    sender: string;
  }>({
    visible: false,
    id: '',
    sender: '',
  });

  // Filtered & Paginated Feedbacks
  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      // Rating / Anonymous filter
      if (ratingFilter === '5' && item.rating !== 5) return false;
      if (ratingFilter === '4' && item.rating < 4) return false;
      if (ratingFilter === 'anon' && !item.isAnonymous) return false;

      // Search filter
      if (searchQuery.trim() === '') return true;
      const lower = searchQuery.toLowerCase();
      return (
        item.senderName.toLowerCase().includes(lower) ||
        item.senderEmail.toLowerCase().includes(lower) ||
        item.subject.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower)
      );
    });
  }, [feedback, searchQuery, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));
  const paginatedFeedback = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFeedback.slice(start, start + pageSize);
  }, [filteredFeedback, currentPage]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = feedback.length;
    const anonCount = feedback.filter((f) => f.isAnonymous).length;
    const avgRating = total > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) : '5.0';
    const pendingCount = feedback.filter((f) => f.status === 'Pending').length;

    return { total, anonCount, avgRating, pendingCount };
  }, [feedback]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await apiClient.delete(`/api/v2/feedback/${deleteModal.id}`);
      setDeleteModal((prev) => ({ ...prev, visible: false }));
      await refetch();
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Page Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>User Feedbacks & Suggestions</Text>
          <Text style={styles.pageSubtitle}>
            Central repository of public and anonymous feedback submissions submitted by clients.
          </Text>
        </View>
      </View>

      {/* Overview Stat Cards */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBg, { backgroundColor: '#EEF2FF' }]}>
            <Lucide name="message-square" size={20} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Feedbacks</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
            <Lucide name="star" size={20} color="#D97706" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.avgRating} / 5</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBg, { backgroundColor: '#F1F5F9' }]}>
            <Lucide name="eye-off" size={20} color="#475569" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.anonCount}</Text>
            <Text style={styles.statLabel}>Anonymous Submissions</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBg, { backgroundColor: '#FEF2F2' }]}>
            <Lucide name="clock" size={20} color="#DC2626" />
          </View>
          <View>
            <Text style={styles.statNumber}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>
      </View>

      {/* Control Bar: Search & Quick Filters */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by sender, email, subject, or keywords..."
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setCurrentPage(1);
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Lucide name="x" size={16} color={COLORS.neutral[400]} />
            </Pressable>
          )}
        </View>

        <View style={styles.filterGroup}>
          <Pressable
            style={[styles.filterChip, ratingFilter === 'all' && styles.filterChipActive]}
            onPress={() => { setRatingFilter('all'); setCurrentPage(1); }}
          >
            <Text style={[styles.filterChipText, ratingFilter === 'all' && styles.filterChipTextActive]}>
              All ({feedback.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, ratingFilter === 'anon' && styles.filterChipActive]}
            onPress={() => { setRatingFilter('anon'); setCurrentPage(1); }}
          >
            <Lucide name="eye-off" size={13} color={ratingFilter === 'anon' ? COLORS.neutral.white : '#475569'} />
            <Text style={[styles.filterChipText, ratingFilter === 'anon' && styles.filterChipTextActive]}>
              Anonymous Only
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterChip, ratingFilter === '5' && styles.filterChipActive]}
            onPress={() => { setRatingFilter('5'); setCurrentPage(1); }}
          >
            <Text style={[styles.filterChipText, ratingFilter === '5' && styles.filterChipTextActive]}>
              5 Stars ★
            </Text>
          </Pressable>

          <Pressable style={styles.refreshBtn} onPress={() => refetch()}>
            <Lucide name="refresh-cw" size={14} color="#4F46E5" />
          </Pressable>
        </View>
      </View>

      {/* Main List */}
      {isLoading && (
        <View style={styles.stateCenter}>
          <ActivityIndicator size="large" color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Loading feedback database...</Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.stateCenter}>
          <Lucide name="alert-circle" size={32} color={COLORS.semantic.error} />
          <Text style={styles.stateText}>Failed to fetch feedback entries.</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <View style={styles.listContainer}>
          {paginatedFeedback.length === 0 ? (
            <View style={[styles.emptyCard, SHADOWS.card]}>
              <Lucide name="message-square" size={40} color={COLORS.neutral[300]} />
              <Text style={styles.emptyTitle}>No matching feedbacks found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search keywords or filter criteria.</Text>
            </View>
          ) : (
            paginatedFeedback.map((item) => {
              const isExpanded = expandedId === item.id;
              const isAnon = item.isAnonymous;

              return (
                <View key={item.id} style={[styles.card, SHADOWS.card]}>
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.senderWrapper}>
                      <View style={styles.titleRow}>
                        <Text style={styles.senderName}>
                          {item.senderName}
                        </Text>
                      </View>

                      <View style={styles.subtextRow}>
                        <View style={styles.emailRow}>
                          <Lucide name="mail" size={13} color="#94A3B8" />
                          <Text style={styles.senderEmail}>
                            {item.senderEmail}
                          </Text>
                        </View>

                        <Text style={styles.dot}>·</Text>
                        {renderRatingStars(item.rating)}

                        <Text style={styles.dot}>·</Text>
                        <View style={styles.badgeSubject}>
                          <Text style={styles.badgeSubjectText}>{item.subject}</Text>
                        </View>

                        <View style={styles.badgeDate}>
                          <Text style={styles.badgeDateText}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.headerRight}>
                      <Pressable
                        style={[styles.actionBtn, styles.deleteBtn]}
                        onPress={() =>
                          setDeleteModal({
                            visible: true,
                            id: item.id,
                            sender: isAnon ? 'Anonymous Submission' : item.senderName,
                          })
                        }
                      >
                        <Lucide name="trash-2" size={15} color="#EF4444" />
                      </Pressable>

                      <View style={styles.vDivider} />

                      <Pressable style={styles.expandBtn} onPress={() => toggleExpand(item.id)}>
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
                      <View style={styles.expandedHeader}>
                        <Lucide name="message-square" size={15} color="#6366F1" />
                        <Text style={styles.expandedHeaderText}>FEEDBACK DETAILS & MESSAGE</Text>
                      </View>

                      <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{item.message}</Text>
                      </View>

                      {isAnon && (
                        <View style={styles.privacyNoteBox}>
                          <Lucide name="shield" size={14} color="#64748B" />
                          <Text style={styles.privacyNoteText}>
                            Personal identity details have been securely masked at backend for user privacy.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Pagination Footer */}
      {!isLoading && !isError && filteredFeedback.length > 0 && (
        <View style={[styles.paginationBar, isMobile && styles.paginationMobile]}>
          <Text style={styles.paginationText}>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredFeedback.length)} to{' '}
            {Math.min(currentPage * pageSize, filteredFeedback.length)} of {filteredFeedback.length} entries
          </Text>

          <View style={styles.pageNavRow}>
            <Pressable
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <Lucide name="chevron-left" size={16} color={currentPage === 1 ? '#CBD5E1' : '#334155'} />
            </Pressable>

            <Text style={styles.pageIndicatorText}>
              Page {currentPage} of {totalPages}
            </Text>

            <Pressable
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <Lucide name="chevron-right" size={16} color={currentPage === totalPages ? '#CBD5E1' : '#334155'} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Delete Modal */}
      <DeleteAdminItemModal
        visible={deleteModal.visible}
        itemTitle={deleteModal.sender}
        itemType="Feedback Entry"
        onClose={() => setDeleteModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={handleDeleteConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[20],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 280,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 2,
  },

  // Controls
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
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
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.circle,
  },
  filterChipActive: {
    backgroundColor: COLORS.brand[600],
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  filterChipTextActive: {
    color: COLORS.neutral.white,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.input,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List & Cards
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
  },
  senderWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  badgeAnon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeAnonText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#475569',
  },
  badgePublic: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgePublicText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#166534',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderEmail: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  dot: {
    color: COLORS.neutral[400],
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSubject: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeSubjectText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#4F46E5',
  },
  badgeDate: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeDateText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  vDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: 4,
  },
  expandBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: '#F8FAFC',
    padding: SPACING[16],
    gap: 10,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedHeaderText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  messageBox: {
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  messageText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#334155',
    lineHeight: 20,
  },
  privacyNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
  },
  privacyNoteText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#475569',
  },

  // Empty & Loading States
  stateCenter: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  retryBtn: {
    paddingHorizontal: 16,
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
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[800],
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },

  // Pagination
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  paginationMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  paginationText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
  },
  pageNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageIndicatorText: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
});
