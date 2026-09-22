import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Meeting } from '@edge/api';
import { Button, Icon, useTheme } from '@edge/ui';

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onJoin }) => {
  const { colors } = useTheme();
  const isInterRegional = meeting.scope === 'InterRegional';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {meeting.title}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.scopeBadge,
                {
                  backgroundColor: isInterRegional ? colors.brand.accent + '20' : colors.brand.primary + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.scopeText,
                  { color: isInterRegional ? colors.brand.accent : colors.brand.primary },
                ]}
              >
                {isInterRegional ? 'Inter-Regional' : 'My Regional Office'}
              </Text>
            </View>
            <View style={styles.timeBadge}>
              <Icon name="clock" size={12} color={colors.textMuted} />
              <Text style={[styles.timeText, { color: colors.textMuted }]}>
                {new Date(meeting.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        <Button variant="primary" size="sm" onPress={() => onJoin(meeting)}>
          Join Call
        </Button>
      </View>

      {meeting.description ? (
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {meeting.description}
        </Text>
      ) : null}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.hostText, { color: colors.textMuted }]}>
          Host: <Text style={{ color: colors.text, fontWeight: '600' }}>{meeting.hostUserName}</Text> ({meeting.tenantName ?? 'Regional Office'})
        </Text>
        <Text style={[styles.participantCount, { color: colors.textMuted }]}>
          {meeting.participants.length} invited
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  titleInfo: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  scopeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scopeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 6,
  },
  hostText: {
    fontSize: 12,
  },
  participantCount: {
    fontSize: 12,
  },
});
