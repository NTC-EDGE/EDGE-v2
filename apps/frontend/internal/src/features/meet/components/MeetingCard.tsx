import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Meeting } from '@edge/api';
import { Button, Icon, useTheme } from '@edge/ui';

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meeting: Meeting) => void;
  onInvite?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
  onViewRecording?: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onInvite,
  onDelete,
  onViewRecording,
}) => {
  const { colors, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const isInterRegional = meeting.scope === 'InterRegional';
  const isFinished = meeting.status === 'Ended' || meeting.status === 'Cancelled';
  const isLive = meeting.status === 'Live';

  const getStatusBadge = () => {
    if (isLive) {
      return { bg: '#DCFCE7', text: '#15803D', label: 'Live' };
    }
    if (meeting.status === 'Ended') {
      return { bg: '#F1F5F9', text: '#64748B', label: 'Finished' };
    }
    if (meeting.status === 'Cancelled') {
      return { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' };
    }
    return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Upcoming' };
  };

  const statusInfo = getStatusBadge();

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
          <View style={styles.titleWithStatus}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {meeting.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
            </View>
          </View>

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

        <View style={styles.actionsRow}>
          {onInvite && !isFinished && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth={false}
              leftIcon={<Icon name="user-plus" size={14} color={colors.text} />}
              onPress={() => onInvite(meeting)}
            >
              Invite
            </Button>
          )}

          {!isFinished ? (
            <Button variant="primary" size="sm" fullWidth={false} onPress={() => onJoin(meeting)}>
              Join Call
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              leftIcon={<Icon name="play-circle" size={14} color={colors.text} />}
              onPress={() => onViewRecording?.(meeting)}
            >
              Recording
            </Button>
          )}

          {/* Action Menu (⋮) */}
          <Pressable
            style={[styles.menuButton, { borderColor: colors.border }]}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Meeting options"
          >
            <Icon name="more-vertical" size={16} color={colors.text} />
          </Pressable>
        </View>
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

      {/* Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            {!isFinished && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onJoin(meeting);
                }}
              >
                <Icon name="video" size={14} color={colors.brand.primary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Join Meeting</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onViewRecording?.(meeting);
              }}
            >
              <Icon name="film" size={14} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>View Recording</Text>
            </Pressable>

            {onDelete && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setShowDeleteModal(true);
                }}
              >
                <Icon name="trash-2" size={14} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Meeting</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <View
            style={[
              styles.confirmModalCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Delete Meeting</Text>
            <Text style={[styles.confirmDesc, { color: colors.textMuted }]}>
              Are you sure you want to delete &quot;{meeting.title}&quot;? Note: If this meeting has a saved recording, it will remain archived in according to retention policies.
            </Text>
            <View style={styles.confirmBtnRow}>
              <Button variant="outline" size="sm" onPress={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onPress={() => {
                  setShowDeleteModal(false);
                  onDelete?.(meeting.id);
                }}
              >
                Delete Meeting
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  titleWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuCard: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  confirmDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});
