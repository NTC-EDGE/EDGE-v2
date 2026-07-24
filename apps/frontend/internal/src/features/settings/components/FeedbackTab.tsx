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
  onDeleteFeedback: (id: string) => void;
}

export function FeedbackTab({ feedback, onDeleteFeedback }: FeedbackTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedback = useMemo(() => {
    if (searchQuery.trim() === '') return feedback;
    const lower = searchQuery.toLowerCase();
    return feedback.filter(
      (item) =>
        item.sender.toLowerCase().includes(lower) ||
        item.subject.toLowerCase().includes(lower) ||
        item.message.toLowerCase().includes(lower)
    );
  }, [feedback, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.controlBar, isMobile && styles.controlBarMobile]}>
        <View style={styles.searchBox}>
          <Lucide name="search" size={18} color={COLORS.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Feedback & Compliance Submissions..."
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
      </View>

      {/* Feedback List */}
      <View style={styles.listContainer}>
        {filteredFeedback.length === 0 ? (
          <View style={[styles.emptyCard, SHADOWS.card]}>
            <Lucide name="message-square" size={36} color={COLORS.neutral[400]} />
            <Text style={styles.emptyTitle}>No matching feedback entries found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search filters.</Text>
          </View>
        ) : (
          filteredFeedback.map((item) => (
            <View key={item.id} style={[styles.card, SHADOWS.card]}>
              <View style={styles.cardHeader}>
                <View style={styles.senderWrapper}>
                  <Text style={styles.senderName}>{item.sender}</Text>
                  <Text style={styles.senderEmail}>{item.email} · {item.date}</Text>
                </View>

                <View style={styles.headerRight}>
                  <View
                    style={[
                      styles.pillBadge,
                      item.status === 'Reviewed' ? styles.badgeGreen : styles.badgePurple,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status === 'Reviewed' ? styles.badgeTextGreen : styles.badgeTextPurple,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => onDeleteFeedback(item.id)}
                  >
                    <Lucide name="trash-2" size={15} color="#EF4444" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.subjectText}>{item.subject}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  },
  controlBarMobile: {},
  searchBox: {
    flex: 1,
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
  listContainer: {
    gap: SPACING[12],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    padding: SPACING[16],
    gap: SPACING[12],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
  },
  senderWrapper: {
    flex: 1,
  },
  senderName: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  senderEmail: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextGreen: {
    color: '#16A34A',
  },
  badgePurple: {
    backgroundColor: '#EEF2FF',
  },
  badgeTextPurple: {
    color: '#6366F1',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
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
  cardBody: {
    gap: 4,
  },
  subjectText: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: COLORS.neutral[800],
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
    lineHeight: 20,
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
});
