import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { FeedbackItem } from '../data/mockAdminSettings';

interface FeedbackTabProps {
  feedback: FeedbackItem[];
  onDeleteFeedback: (id: string, subject: string) => void;
}

export function FeedbackTab({ feedback, onDeleteFeedback }: FeedbackTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('fb-1');

  const filteredFeedback = useMemo(() => {
    if (searchQuery.trim() === '') return feedback;
    const lower = searchQuery.toLowerCase();
    return feedback.filter(
      (item) =>
        item.sender.toLowerCase().includes(lower) ||
        item.email.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower)
    );
  }, [feedback, searchQuery]);

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
        {/* Left Search Box */}
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

        {/* Right Filter Controls Row */}
        <View style={styles.filterControlsRow}>
          <Pressable style={styles.filterBtn}>
            <Lucide name="calendar" size={15} color="#4F46E5" />
            <Text style={styles.filterBtnText}>Date Range</Text>
          </Pressable>

          <Pressable style={styles.filterBtn}>
            <Lucide name="sliders" size={15} color="#4F46E5" />
            <Text style={styles.filterBtnText}>Sort: Date Submitted</Text>
          </Pressable>

          <Pressable style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Descending ↓</Text>
          </Pressable>

          <Pressable style={styles.filterBtn}>
            <Lucide name="external-link" size={15} color="#4F46E5" />
            <Text style={styles.filterBtnText}>Open in Sheets</Text>
          </Pressable>
        </View>
      </View>

      {/* Feedback Accordion Cards List */}
      <View style={styles.listContainer}>
        {filteredFeedback.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="message-square" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching feedback entries found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search filters.</Text>
          </View>
        ) : (
          filteredFeedback.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <View key={item.id} style={[styles.card, SHADOWS.card]}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.senderWrapper}>
                    <Text style={styles.senderName}>{item.sender}</Text>

                    <View style={styles.subtextRow}>
                      <View style={styles.emailRow}>
                        <Lucide name="mail" size={14} color="#94A3B8" />
                        <Text style={styles.senderEmail}>{item.email}</Text>
                      </View>

                      <Text style={styles.separatorDot}>·</Text>
                      {renderRatingStars(item.rating)}

                      <Text style={styles.separatorDot}>·</Text>
                      <View style={styles.badgePurple}>
                        <Text style={styles.badgeTextPurple}>Feedback</Text>
                      </View>

                      <View style={styles.badgeDate}>
                        <Text style={styles.badgeDateText}>DATE: {item.date}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.headerRight}>
                    <Pressable
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => onDeleteFeedback(item.id, item.sender)}
                    >
                      <Lucide name="trash-2" size={15} color="#EF4444" />
                    </Pressable>

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

                {/* Expanded Content (Matching Screenshot) */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {/* Header */}
                    <View style={styles.expandedHeaderLeft}>
                      <Lucide name="message-square" size={16} color="#6366F1" />
                      <Text style={styles.expandedHeaderText}>FEEDBACK MESSAGE</Text>
                    </View>

                    {/* Message Box */}
                    <View style={styles.messageBox}>
                      <Text style={styles.messageText}>
                        {item.message || 'No comment provided.'}
                      </Text>
                    </View>

                    {/* 4-Grid Metadata Details Row */}
                    <View style={[styles.metadataGridRow, isMobile && styles.metadataGridMobile]}>
                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>OFFICE / AGENCY</Text>
                        <Text style={styles.metaCardValue}>
                          {item.officeAgency || item.sender}
                        </Text>
                      </View>

                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>CONTACT NUMBER</Text>
                        <Text style={styles.metaCardValue}>
                          {item.contactNumber || 'N/A'}
                        </Text>
                      </View>

                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>SUBMITTED BY</Text>
                        <Text style={styles.metaCardValue}>
                          {item.submittedBy || item.email}
                        </Text>
                      </View>

                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>REGION</Text>
                        <Text style={styles.metaCardValue}>{item.region || 'XIV'}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Footer Pagination Bar */}
      <View style={[styles.paginationBar, isMobile && styles.paginationBarMobile]}>
        <Text style={styles.paginationShowing}>Showing 1 to 10 of 81 entries</Text>

        <View style={styles.paginationControls}>
          <Text style={styles.paginationShowingRight}>
            Showing 1 to 10 of 81 entries
          </Text>

          <Text style={styles.paginationRowsText}>Rows per page</Text>
          <View style={styles.rowsDropdown}>
            <Text style={styles.rowsDropdownText}>10</Text>
            <Lucide name="chevron-down" size={14} color={COLORS.neutral[600]} />
          </View>

          <Text style={styles.pageInfoText}>Page 1 of 9</Text>

          <View style={styles.navButtonsRow}>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevrons-left" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevron-left" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnActive}>
              <Text style={styles.pageNavTextActive}>1</Text>
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevron-right" size={14} color={COLORS.neutral[300]} />
            </Pressable>
            <Pressable style={styles.pageNavBtnDisabled}>
              <Lucide name="chevrons-right" size={14} color={COLORS.neutral[300]} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    paddingBottom: SPACING[32],
  },

  // Control Bar
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
    flexWrap: 'wrap',
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

  // List
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

  // Expanded Content (Matching User Screenshot)
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

  // Metadata Grid Row
  metadataGridRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  metadataGridMobile: {
    flexDirection: 'column',
  },
  metaCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  metaCardLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metaCardValue: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Empty State
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

  // Pagination Bar
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
  paginationShowingRight: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[400],
    marginRight: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  paginationRowsText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
  },
  rowsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowsDropdownText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  pageInfoText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageNavBtnActive: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavTextActive: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
  pageNavBtnDisabled: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
