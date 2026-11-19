import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MeetingParticipant, WaitingRoomRequestItem } from '@edge/api';
import { Avatar, Button, Icon, useTheme } from '@edge/ui';
import { PeerLiveMediaState } from '../hooks/useWebRtcMeeting';

interface InMeetingParticipantsSidebarProps {
  visible: boolean;
  onClose: () => void;
  isHostOrAdmin: boolean;
  hostUserId: string;
  currentUserId?: string;
  inCallParticipants: MeetingParticipant[];
  allInvitedParticipants: MeetingParticipant[];
  waitingRequests: WaitingRoomRequestItem[];
  peerMediaStates: Record<string, PeerLiveMediaState>;
  speakingUserIds: string[];
  spotlightedUserId: string | null;
  isSelfMicMuted: boolean;
  isSelfVideoMuted: boolean;
  onOpenInviteModal: () => void;
  onAdmitWaiting: (req: WaitingRoomRequestItem) => void;
  onAdmitAllWaiting: () => void;
  onDenyWaiting: (req: WaitingRoomRequestItem) => void;
  onMuteParticipant: (userId: string) => void;
  onMuteAll: () => void;
  onSpotlightParticipant: (userId: string | null) => void;
  onKickParticipant: (userId: string) => void;
}

export const InMeetingParticipantsSidebar: React.FC<InMeetingParticipantsSidebarProps> = ({
  visible,
  onClose,
  isHostOrAdmin,
  hostUserId,
  currentUserId,
  inCallParticipants,
  allInvitedParticipants,
  waitingRequests,
  peerMediaStates,
  speakingUserIds,
  spotlightedUserId,
  isSelfMicMuted,
  isSelfVideoMuted,
  onOpenInviteModal,
  onAdmitWaiting,
  onAdmitAllWaiting,
  onDenyWaiting,
  onMuteParticipant,
  onMuteAll,
  onSpotlightParticipant,
  onKickParticipant,
}) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const inCallIds = new Set(inCallParticipants.map((p) => p.userId));
  const notYetJoined = allInvitedParticipants.filter((p) => !inCallIds.has(p.userId));

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderLeftColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Icon name="users" size={16} color={colors.brand.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            People ({inCallParticipants.length})
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close participants">
          <Icon name="x" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={[styles.topActionsBar, { borderBottomColor: colors.border }]}>
        <Button
          variant="primary"
          size="sm"
          fullWidth={ !isHostOrAdmin || inCallParticipants.length <= 1 }
          leftIcon={<Icon name="user-plus" size={13} color="#FFFFFF" />}
          onPress={onOpenInviteModal}
        >
          Add / Share
        </Button>
        {isHostOrAdmin && inCallParticipants.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            fullWidth={false}
            leftIcon={<Icon name="mic-off" size={13} color={colors.text} />}
            onPress={onMuteAll}
          >
            Mute All
          </Button>
        )}
      </View>

      <ScrollView style={styles.scrollArea}>
        {/* 1. Waiting Room Lobby */}
        {isHostOrAdmin && waitingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
                WAITING IN LOBBY ({waitingRequests.length})
              </Text>
              {waitingRequests.length > 1 && (
                <Pressable onPress={onAdmitAllWaiting}>
                  <Text style={[styles.admitAllLink, { color: colors.brand.primary }]}>Admit All</Text>
                </Pressable>
              )}
            </View>
            {waitingRequests.map((req) => (
              <View
                key={req.connectionId}
                style={[
                  styles.personRow,
                  {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                  },
                ]}
              >
                <Avatar name={req.userName} size="sm" />
                <Text style={[styles.personName, { color: colors.text }]} numberOfLines={1}>
                  {req.userName}
                </Text>
                <View style={styles.rowIcons}>
                  <Pressable style={styles.admitSmallBtn} onPress={() => onAdmitWaiting(req)}>
                    <Text style={styles.admitSmallText}>Admit</Text>
                  </Pressable>
                  <Pressable style={styles.iconActionBtn} onPress={() => onDenyWaiting(req)}>
                    <Icon name="x" size={14} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. In This Meeting */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            IN THIS CALL ({inCallParticipants.length})
          </Text>
          {inCallParticipants.map((p) => {
            const isSelf = p.userId === currentUserId || p.userId === 'self';
            const media = peerMediaStates[p.userId];
            const micOff = isSelf ? isSelfMicMuted : Boolean(media?.isMicMuted ?? p.isMutedByHost);
            const camOff = isSelf ? isSelfVideoMuted : Boolean(media?.isVideoMuted);
            const speaking = speakingUserIds.includes(p.userId);
            const isSpot = spotlightedUserId === p.userId;

            return (
              <View
                key={p.userId}
                style={[styles.personRow, { borderColor: colors.border }]}
              >
                <Avatar name={p.fullName} size="sm" />
                <View style={styles.personMeta}>
                  <Text style={[styles.personName, { color: colors.text }]} numberOfLines={1}>
                    {p.fullName} {isSelf ? '(You)' : ''}
                  </Text>
                  <Text style={[styles.roleSub, { color: colors.textMuted }]}>
                    {p.userId === hostUserId ? 'Meeting Host' : p.role}
                    {p.isHandRaised ? ' • ✋ Hand Raised' : ''}
                    {speaking ? ' • Speaking' : ''}
                  </Text>
                </View>

                <View style={styles.rowIcons}>
                  <Icon
                    name={micOff ? 'mic-off' : 'mic'}
                    size={13}
                    color={micOff ? '#EF4444' : speaking ? '#22C55E' : colors.textMuted}
                  />
                  <Icon
                    name={camOff ? 'video-off' : 'video'}
                    size={13}
                    color={camOff ? '#94A3B8' : colors.textMuted}
                  />

                  {isHostOrAdmin && !isSelf && (
                    <>
                      {!micOff && (
                        <Pressable
                          style={styles.iconActionBtn}
                          onPress={() => onMuteParticipant(p.userId)}
                          accessibilityLabel={`Mute ${p.fullName}`}
                        >
                          <Icon name="volume-x" size={13} color="#F59E0B" />
                        </Pressable>
                      )}
                      <Pressable
                        style={styles.iconActionBtn}
                        onPress={() => onSpotlightParticipant(isSpot ? null : p.userId)}
                        accessibilityLabel={`Spotlight ${p.fullName}`}
                      >
                        <Icon name="star" size={13} color={isSpot ? '#FBBF24' : colors.textMuted} />
                      </Pressable>
                      {p.userId !== hostUserId && (
                        <Pressable
                          style={styles.iconActionBtn}
                          onPress={() => onKickParticipant(p.userId)}
                          accessibilityLabel={`Remove ${p.fullName}`}
                        >
                          <Icon name="user-minus" size={13} color="#EF4444" />
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* 3. Invited / Not Joined Yet */}
        {notYetJoined.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              INVITED — NOT IN CALL ({notYetJoined.length})
            </Text>
            {notYetJoined.map((p) => (
              <View key={p.userId} style={[styles.personRow, { borderColor: colors.border, opacity: 0.7 }]}>
                <Avatar name={p.fullName} size="sm" />
                <View style={styles.personMeta}>
                  <Text style={[styles.personName, { color: colors.text }]} numberOfLines={1}>
                    {p.fullName}
                  </Text>
                  <Text style={[styles.roleSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {p.email || 'Invited'}
                  </Text>
                </View>
              </View>
            ))}
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
  topActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scrollArea: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 16,
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  admitAllLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  personMeta: {
    flex: 1,
    gap: 2,
  },
  personName: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleSub: {
    fontSize: 11,
  },
  rowIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  admitSmallBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  admitSmallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionBtn: {
    padding: 4,
  },
});
