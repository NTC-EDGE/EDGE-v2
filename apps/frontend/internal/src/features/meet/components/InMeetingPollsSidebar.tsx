import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MeetingPoll } from '@edge/api';
import { Button, EmptyState, Icon, useTheme } from '@edge/ui';

interface InMeetingPollsSidebarProps {
  visible: boolean;
  onClose: () => void;
  isHostOrAdmin: boolean;
  currentUserId?: string;
  polls: MeetingPoll[];
  onOpenCreatePoll: () => void;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onClosePoll: (pollId: string) => void;
}

export const InMeetingPollsSidebar: React.FC<InMeetingPollsSidebarProps> = ({
  visible,
  onClose,
  isHostOrAdmin,
  currentUserId,
  polls,
  onOpenCreatePoll,
  onVotePoll,
  onClosePoll,
}) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderLeftColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Icon name="bar-chart-2" size={16} color={colors.brand.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Polls ({polls.length})</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close polls">
          <Icon name="x" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      {isHostOrAdmin && (
        <View style={[styles.topActionRow, { borderBottomColor: colors.border }]}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<Icon name="plus" size={14} color="#FFFFFF" />}
            onPress={onOpenCreatePoll}
          >
            New Live Poll
          </Button>
        </View>
      )}

      <ScrollView style={styles.scroll}>
        {polls.length === 0 ? (
          <EmptyState
            title="No polls yet"
            description={
              isHostOrAdmin
                ? 'Launch a live poll to gather instant decisions from attendees.'
                : 'Live polls created by the host will appear here.'
            }
          />
        ) : (
          <View style={styles.pollList}>
            {polls.map((poll) => {
              const totalVotes = poll.votes.length;
              const myVote = currentUserId
                ? poll.votes.find((v) => v.userId === currentUserId)
                : undefined;

              return (
                <View
                  key={poll.id}
                  style={[
                    styles.pollCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.pollMetaRow}>
                    <View
                      style={[
                        styles.statusChip,
                        { backgroundColor: poll.isClosed ? '#E2E8F0' : '#DCFCE7' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          { color: poll.isClosed ? '#475569' : '#15803D' },
                        ]}
                      >
                        {poll.isClosed ? 'Closed' : 'Live'}
                      </Text>
                    </View>
                    {poll.isAnonymous && (
                      <Text style={[styles.anonTag, { color: colors.textMuted }]}>Anonymous</Text>
                    )}
                  </View>

                  <Text style={[styles.questionText, { color: colors.text }]}>{poll.question}</Text>

                  <View style={styles.optionsStack}>
                    {poll.options.map((optLabel, idx) => {
                      const count = poll.votes.filter((v) => v.selectedOptionIndex === idx).length;
                      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const selected = myVote?.selectedOptionIndex === idx;

                      return (
                        <Pressable
                          key={`${poll.id}_opt_${idx}`}
                          disabled={poll.isClosed}
                          style={[
                            styles.optionCard,
                            {
                              borderColor: selected ? colors.brand.primary : colors.border,
                              backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                            },
                          ]}
                          onPress={() => onVotePoll(poll.id, idx)}
                        >
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${pct}%`,
                                backgroundColor: selected
                                  ? colors.brand.primary + '28'
                                  : colors.brand.primary + '14',
                              },
                            ]}
                          />
                          <View style={styles.optionRowContent}>
                            <Text
                              style={[
                                styles.optionText,
                                {
                                  color: colors.text,
                                  fontWeight: selected ? '700' : '500',
                                },
                              ]}
                            >
                              {optLabel}
                            </Text>
                            <Text style={[styles.voteStat, { color: colors.textMuted }]}>
                              {count} ({pct}%)
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.pollFooter}>
                    <Text style={[styles.totalVotesText, { color: colors.textMuted }]}>
                      {totalVotes} total vote(s)
                    </Text>
                    {isHostOrAdmin && !poll.isClosed && (
                      <Pressable onPress={() => onClosePoll(poll.id)}>
                        <Text style={styles.closePollText}>Close Poll</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: '100%',
    borderLeftWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  topActionRow: {
    padding: 12,
    borderBottomWidth: 1,
  },
  scroll: {
    flex: 1,
    padding: 12,
  },
  pollList: {
    gap: 12,
  },
  pollCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pollMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  anonTag: {
    fontSize: 11,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionsStack: {
    gap: 8,
  },
  optionCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  optionRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 12,
  },
  voteStat: {
    fontSize: 11,
    fontWeight: '600',
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalVotesText: {
    fontSize: 11,
  },
  closePollText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
});
