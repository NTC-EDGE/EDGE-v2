import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import { Meeting } from '@edge/api';
import { Button, ConfirmationModal, Icon, SHADOWS, useTheme } from '@edge/ui';
import { copyTextToClipboard, getMeetingJoinLink } from '../utils/webDomHelpers';

interface MeetingCardProps {
  meeting: Meeting;
  currentUserId?: string;
  onJoin: (meeting: Meeting) => void;
  onInvite?: (meeting: Meeting) => void;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  currentUserId,
  onJoin,
  onInvite,
  onEdit,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const menuBtnRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isInterRegional = meeting.scope === 'InterRegional';
  const isFinished = meeting.status === 'Ended';
  const isCancelled = meeting.status === 'Cancelled';
  const isLive = meeting.status === 'Live';
  const isHost = currentUserId !== undefined && meeting.hostUserId === currentUserId;

  const getStatusBadge = () => {
    if (isLive) {
      return { bg: '#DCFCE7', text: '#15803D', label: 'Live Now' };
    }
    if (meeting.status === 'Ended') {
      return { bg: '#F1F5F9', text: '#64748B', label: 'Ended' };
    }
    if (meeting.status === 'Cancelled') {
      return { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' };
    }
    return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Upcoming' };
  };

  const statusInfo = getStatusBadge();

  const formattedDateTime = (() => {
    const d = new Date(meeting.scheduledStartTime);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  })();

  const handleCopyLink = async () => {
    const ok = await copyTextToClipboard(getMeetingJoinLink(meeting.meetingCode));
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleOpenMenu = () => {
    menuBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const menuWidth = 195;
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;
      let leftPos = (pageX !== undefined ? pageX : 0) + width - menuWidth;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + menuWidth > windowWidth - 10) leftPos = windowWidth - menuWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) + height + 4;
      if (topPos + 190 > windowHeight - 10) {
        topPos = Math.max(10, (pageY !== undefined ? pageY : 0) - 190);
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
          borderColor: isLive ? '#22C55E' : colors.border,
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
              <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.scopeBadge,
                {
                  backgroundColor: isInterRegional
                    ? colors.brand.accent + '20'
                    : colors.brand.primary + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.scopeText,
                  { color: isInterRegional ? colors.brand.accent : colors.brand.primary },
                ]}
              >
                {isInterRegional ? 'Inter-Regional' : 'Regional Office'}
              </Text>
            </View>

            <View style={styles.timeBadge}>
              <Icon name="calendar" size={12} color={colors.textMuted} />
              <Text style={[styles.timeText, { color: colors.textMuted }]}>{formattedDateTime}</Text>
            </View>

            <Pressable style={styles.codePill} onPress={() => void handleCopyLink()}>
              <Icon
                name={copiedLink ? 'check' : 'link'}
                size={11}
                color={colors.brand.primary}
              />
              <Text style={[styles.codePillText, { color: colors.brand.primary }]}>
                {copiedLink ? 'Copied!' : meeting.meetingCode}
              </Text>
            </Pressable>
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
              Share
            </Button>
          )}

          {!isFinished && !isCancelled && (
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              leftIcon={<Icon name="video" size={14} color="#FFFFFF" />}
              onPress={() => onJoin(meeting)}
            >
              {isLive ? 'Join Live' : 'Join'}
            </Button>
          )}

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
          Host:{' '}
          <Text style={{ color: colors.text, fontWeight: '600' }}>{meeting.hostUserName}</Text> (
          {meeting.tenantName ?? 'Regional Office'})
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

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                void handleCopyLink();
              }}
            >
              <Icon name="link" size={14} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Copy Join Link</Text>
            </Pressable>

            {isHost && onEdit && !isFinished && !isCancelled && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  onEdit(meeting);
                }}
              >
                <Icon name="edit-3" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Edit / Reschedule</Text>
              </Pressable>
            )}

            {isHost && onDelete && !isCancelled && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setShowDeleteModal(true);
                }}
              >
                <Icon name="trash-2" size={14} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Cancel Meeting</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <ConfirmationModal
        visible={showDeleteModal}
        title="Cancel Meeting?"
        subtitle={`Are you sure you want to cancel "${meeting.title}"?`}
        variant="danger"
        confirmText="Cancel Meeting"
        cancelText="Keep"
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
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
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
    marginTop: 5,
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
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  codePillText: {
    fontSize: 11,
    fontWeight: '600',
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
  menuCard: {
    position: 'absolute',
    width: 195,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 20,
    zIndex: 99999,
    ...Platform.select({
      web: {
        boxShadow:
          '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
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
