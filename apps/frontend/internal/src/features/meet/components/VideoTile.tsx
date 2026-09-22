import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Icon, useTheme } from '@edge/ui';
import { MeetingParticipant } from '@edge/api';

interface VideoTileProps {
  participant: MeetingParticipant;
  isSelf?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({ participant, isSelf = false }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.centerAvatar}>
        <Avatar name={participant.fullName} size="lg" />
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.nameTag} numberOfLines={1}>
          {participant.fullName} {isSelf ? '(You)' : ''}
        </Text>
        <View style={styles.iconRow}>
          {participant.isHandRaised ? (
            <View style={styles.handBadge}>
              <Text style={styles.handText}>✋ #{participant.handRaiseQueuePosition ?? 1}</Text>
            </View>
          ) : null}
          {participant.isMutedByHost ? (
            <Icon name="mic-off" size={14} color="#EF4444" />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    minWidth: 220,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centerAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nameTag: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  handBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
