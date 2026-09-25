import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import { Meeting } from '@edge/api';
import { Button, ConfirmationModal, Icon, SHADOWS, useTheme } from '@edge/ui';

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
  const menuBtnRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isInterRegional = meeting.scope === 'InterRegional';
  const isFinished = meeting.status === 'Ended';
  const isCancelled = meeting.status === 'Cancelled';
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

  const handleOpenMenu = () => {
    menuBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth = 190;
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;
      let leftPos = (pageX !== undefined ? pageX : 0) + width - menuWidth;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + menuWidth > windowWidth - 10) leftPos = windowWidth - menuWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) + height + 4;
      if (topPos + 170 > windowHeight - 10) {
        topPos = Math.max(10, (pageY !== undefined ? pageY : 0) - 170);
      }
      setMenuPos({ top: topPos, left: leftPos });
      setMenuVisible(true);
    });
  };

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
          {onInvite && !isFinished && !isCancelled && (
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

          {!isFinished && !isCancelled ? (
            <Button variant="primary" size="sm" fullWidth={false} onPress={() => onJoin(meeting)}>
              Join Call
            </Button>
          ) : isFinished && !isCancelled ? (
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              leftIcon={<Icon name="play-circle" size={14} color={colors.text} />}
              onPress={() => onViewRecording?.(meeting)}
            >
              Recording
            </Button>
          ) : null}

          {/* Action Menu (⋮) */}
          <View ref={menuBtnRef} collapsable={false}>
            <Pressable
              style={[styles.menuButton, { borderColor: colors.border }]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleOpenMenu();
              }}
              accessibilityLabel="Meeting options"
            >
              <Icon name="more-vertical" size={16} color={colors.text} />
            </Pressable>
          </View>
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

      {/* Action Menu Modal Dropdown */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={(e) => {
            e.stopPropagation?.();
            setMenuVisible(false);
          }}
        >
          <View
            style={[
              styles.menuCard,
              {
                top: menuPos.top,
                left: menuPos.left,
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
              SHADOWS.modal,
            ]}
          >
            {!isFinished && !isCancelled && (
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

            {isFinished && !isCancelled && (
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
            )}

            {onDelete && !isCancelled && (
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

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Meeting?"
        subtitle={`Are you sure you want to delete "${meeting.title}"? Note: If this meeting has a saved recording, it will remain archived according to retention policies.`}
        variant="danger"
        confirmText="Delete Meeting"
        cancelText="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete?.(meeting.id);
        }}
      />
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
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    zIndex: 99998,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuCard: {
    position: 'absolute',
    width: 190,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 20,
    zIndex: 99999,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    }),
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
});
