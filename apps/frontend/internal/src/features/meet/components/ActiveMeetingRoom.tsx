import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Meeting, meetService, safeAsync, realTimeService } from '@edge/api';
import { AlertToast, Button, Icon, useTheme } from '@edge/ui';
import { useMeetingRoom } from '../hooks/useMeetingRoom';
import { MeetingRoomController } from '../context/MeetingSessionContext';
import { VideoTile } from './VideoTile';
import { ScreenShareStage } from './ScreenShareStage';
import { MeetingControlsBar } from './MeetingControlsBar';
import { FloatingReactionsOverlay } from './FloatingReactionsOverlay';
import { InMeetingChatSidebar } from './InMeetingChatSidebar';
import { InMeetingParticipantsSidebar } from './InMeetingParticipantsSidebar';
import { InMeetingPollsSidebar } from './InMeetingPollsSidebar';
import { InMeetingPollModal } from '../forms/InMeetingPollModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { DeviceSettingsModal } from '../forms/DeviceSettingsModal';
import { CreatePollFormValues } from '../schemas/meetSchemas';
import { copyTextToClipboard, getMeetingJoinLink, isWebMediaSupported } from '../utils/webDomHelpers';

interface ActiveMeetingRoomProps {
  meeting: Meeting;
  currentUserId?: string;
  currentUserName?: string;
  roomController?: MeetingRoomController;
  onLeave: () => void;
  onEndForEveryone?: () => void;
}

export const ActiveMeetingRoom: React.FC<ActiveMeetingRoomProps> = ({
  meeting: initialMeeting,
  currentUserId,
  currentUserName,
  roomController,
  onLeave,
  onEndForEveryone,
}) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  // Use shared MeetingSessionContext controller when provided, or fallback for standalone usage
  const standaloneRoom = useMeetingRoom(
    roomController ? null : initialMeeting,
    currentUserId,
    currentUserName,
    undefined,
    () => onLeave()
  );
  const room = roomController ?? standaloneRoom;
  const activeMeeting = room.meeting ?? initialMeeting;

  const [isCreatePollOpen, setIsCreatePollOpen] = useState<boolean>(false);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState<boolean>(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState<boolean>(false);
  const [isPollsOpen, setIsPollsOpen] = useState<boolean>(false);
  const [useEqualPairGrid, setUseEqualPairGrid] = useState<boolean>(false);
  const [isFilmstripCollapsed, setIsFilmstripCollapsed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localToast, setLocalToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setLocalToast({ message, variant });
    setTimeout(() => setLocalToast(null), 3800);
  };

  useEffect(() => {
    if (room.mediaError) {
      showToast(room.mediaError, 'error');
    }
  }, [room.mediaError]);

  useEffect(() => {
    if (room.roomNotice) {
      showToast(room.roomNotice.message, room.roomNotice.variant);
      room.clearNotice();
    }
  }, [room.roomNotice, room.clearNotice]);

  const handleToggleSidebar = (panel: 'people' | 'polls' | 'chat') => {
    if (panel === 'people') {
      setIsPeopleOpen((prev) => !prev);
      setIsPollsOpen(false);
      room.setIsChatOpen(false);
    } else if (panel === 'polls') {
      setIsPollsOpen((prev) => !prev);
      setIsPeopleOpen(false);
      room.setIsChatOpen(false);
    } else {
      room.toggleChat();
      setIsPeopleOpen(false);
      setIsPollsOpen(false);
    }
  };

  const handleCopyMeetingLink = async () => {
    const ok = await copyTextToClipboard(getMeetingJoinLink(activeMeeting.meetingCode));
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
      showToast('Meeting join link copied to clipboard.', 'success');
    }
  };

  const handleCreatePoll = async (values: CreatePollFormValues) => {
    setIsSubmitting(true);
    const options = [values.option1, values.option2];
    if (values.option3 && values.option3.trim()) options.push(values.option3.trim());
    if (values.option4 && values.option4.trim()) options.push(values.option4.trim());

    await room.createPoll(values.question, options, values.isAnonymous);
    setIsSubmitting(false);
    setIsPollsOpen(true);
  };

  const handleInvite = async (userIds: string[]) => {
    setIsSubmitting(true);
    const [updated, err] = await safeAsync(
      meetService.inviteParticipants(activeMeeting.meetingCode, userIds, true)
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (updated !== null) {
      room.setMeeting(updated);
      showToast(`Invited ${userIds.length} colleague(s).`, 'success');
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    setIsSubmitting(true);
    const [success, err] = await safeAsync(
      meetService.removeParticipant(activeMeeting.meetingCode, userId)
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (success) {
      room.setMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((p) => p.userId !== userId),
            }
          : prev
      );
      showToast('Participant removed from meeting.', 'success');
    }
  };

  const handleLeaveCall = async () => {
    if (!roomController) {
      await room.leaveAndResetRoom();
    }
    onLeave();
  };

  const handleEndCallForAll = async () => {
    if (onEndForEveryone) {
      onEndForEveryone();
      return;
    }
    await room.endMeetingForEveryone();
    onLeave();
  };

  const currentParticipants = room.activeConnectedParticipants;
  const openPollCount = room.polls.filter((p) => !p.isClosed).length;

  // Determine featured/stage participant when in Speaker, Spotlight, or Pinned view
  const featuredUserId =
    room.pinnedUserId ??
    room.spotlightedUserId ??
    (room.layoutMode === 'speaker'
      ? room.speakingUserIds.find((id) => id !== currentUserId && id !== 'self') ??
        currentParticipants.find((p) => p.userId !== currentUserId && p.userId !== 'self')?.userId ??
        null
      : null);

  const featuredParticipant = featuredUserId
    ? currentParticipants.find((p) => p.userId === featuredUserId) ?? null
    : null;

  const isTwoPersonFloatingView =
    room.activeScreenShare === null &&
    featuredParticipant === null &&
    currentParticipants.length === 2 &&
    !useEqualPairGrid;

  const remoteInPair = isTwoPersonFloatingView
    ? currentParticipants.find((p) => p.userId !== currentUserId && p.userId !== 'self') ?? null
    : null;
  const selfInPair = isTwoPersonFloatingView
    ? currentParticipants.find((p) => p.userId === currentUserId || p.userId === 'self') ?? null
    : null;

  const renderTileForParticipant = (
    p: (typeof currentParticipants)[number],
    mode: 'grid' | 'solo' | 'strip' | 'floating' = 'grid'
  ) => {
    const isSelf = p.userId === currentUserId || p.userId === 'self';
    const media = room.peerMediaStates[p.userId];
    const remoteStream = room.remoteStreams[p.userId] ?? null;
    const isTileVideoMuted = isSelf ? room.isVideoMuted : Boolean(media?.isVideoMuted);
    const isTileMicMuted = isSelf
      ? room.isMicMuted
      : Boolean(media?.isMicMuted ?? p.isMutedByHost);
    const isTileSpeaking = room.speakingUserIds.includes(p.userId);
    const isTilePinned = room.pinnedUserId === p.userId;
    const isTileSpotlighted = room.spotlightedUserId === p.userId;

    return (
      <VideoTile
        key={`${mode}_${p.userId}`}
        participant={p}
        isSelf={isSelf}
        stream={isSelf ? room.localStream : remoteStream}
        isVideoMuted={isTileVideoMuted}
        isMicMuted={isTileMicMuted}
        isSpeaking={isTileSpeaking}
        isHandRaised={isSelf ? room.isHandRaised : p.isHandRaised}
        isPinned={isTilePinned}
        isSpotlighted={isTileSpotlighted}
        canModerate={room.isHostOrAdmin}
        speakerDeviceId={room.selectedSpeakerId}
        totalParticipants={currentParticipants.length}
        layoutMode={mode}
        onTogglePin={() =>
          room.setPinnedUserId(room.pinnedUserId === p.userId ? null : p.userId)
        }
        onMuteParticipant={() => void room.muteParticipant(p.userId)}
        onSpotlightParticipant={() =>
          void room.spotlightParticipant(isTileSpotlighted ? null : p.userId)
        }
      />
    );
  };

  return (
    <View style={styles.roomContainer}>
      {localToast !== null && (
        <View style={styles.toastWrapper} pointerEvents="box-none">
          <AlertToast
            message={localToast.message}
            variant={localToast.variant}
            onDismiss={() => setLocalToast(null)}
          />
        </View>
      )}

      {/* Top Meeting Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.meetingTitleText} numberOfLines={1}>
            {activeMeeting.title}
          </Text>

          <Pressable style={styles.meetingBadge} onPress={() => void handleCopyMeetingLink()}>
            <Icon name={copiedLink ? 'check' : 'link'} size={11} color="#93C5FD" />
            <Text style={styles.meetingBadgeText}>
              {copiedLink ? 'Link Copied' : activeMeeting.meetingCode}
            </Text>
          </Pressable>

          <View style={styles.durationPill}>
            <Icon name="clock" size={11} color="#94A3B8" />
            <Text style={styles.durationText}>{room.formattedCallDuration}</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          {room.isAnyRecordingActive && (
            <View style={styles.recordingBanner}>
              <View style={styles.redDot} />
              <Text style={styles.recordingText}>
                {room.isRecording
                  ? `REC ${room.formattedRecordingTime}`
                  : `REC • ${room.remoteRecordingHost ?? 'Host'}`}
              </Text>
            </View>
          )}

          {room.isLargeRoomEconomyMode && (
            <View style={styles.economyBadge}>
              <Text style={styles.economyText}>Active Speaker Video Mode (9+)</Text>
            </View>
          )}

          {currentParticipants.length >= 2 && room.activeScreenShare === null && (
            <Pressable
              style={styles.layoutSwitchBtn}
              onPress={() => {
                if (currentParticipants.length === 2 && featuredParticipant === null) {
                  setUseEqualPairGrid((v) => !v);
                } else {
                  room.setPinnedUserId(null);
                  room.setLayoutMode(room.layoutMode === 'speaker' ? 'auto' : 'speaker');
                }
              }}
            >
              <Icon name="grid" size={12} color="#E2E8F0" />
              <Text style={styles.layoutSwitchText}>
                {currentParticipants.length === 2 && featuredParticipant === null
                  ? useEqualPairGrid
                    ? 'PiP View'
                    : 'Equal Grid'
                  : room.layoutMode === 'speaker'
                    ? 'Grid View'
                    : 'Speaker View'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Native Mobile Notice */}
      {!isWebMediaSupported() && (
        <View style={styles.nativeInfoBanner}>
          <Icon name="info" size={14} color="#93C5FD" />
          <Text style={styles.nativeInfoText}>
            Signaling, live chat, polls, and moderation are active. Join from a Web/Desktop browser for live camera & audio streaming.
          </Text>
        </View>
      )}

      {/* Host Waiting Room Admission Notification Banner */}
      {room.isHostOrAdmin && room.waitingRequests.length > 0 && (
        <View style={styles.waitingRoomHostBanner}>
          <View style={styles.waitingRoomBannerLeft}>
            <View style={styles.waitingBadgePulse}>
              <Icon name="users" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.waitingRoomBannerText}>
              {room.waitingRequests.length === 1 && room.waitingRequests[0]
                ? `${room.waitingRequests[0].userName} is waiting in the lobby`
                : `${room.waitingRequests.length} people are waiting in the lobby`}
            </Text>
          </View>

          <View style={styles.waitingRoomActionsRow}>
            {room.waitingRequests.slice(0, 3).map((req) => (
              <View key={req.connectionId} style={styles.pendingUserChip}>
                <Text style={styles.pendingUserName} numberOfLines={1}>
                  {req.userName}
                </Text>
                <Pressable
                  style={styles.admitBtn}
                  onPress={() => void room.admitWaitingParticipant(req)}
                >
                  <Text style={styles.admitBtnText}>Admit</Text>
                </Pressable>
                <Pressable
                  style={styles.denyBtn}
                  onPress={() => void room.denyWaitingParticipant(req)}
                >
                  <Icon name="x" size={13} color="#EF4444" />
                </Pressable>
              </View>
            ))}
            {room.waitingRequests.length > 1 && (
              <Pressable
                style={styles.admitBtn}
                onPress={() => void room.admitAllWaitingParticipants()}
              >
                <Text style={styles.admitBtnText}>Admit All</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Main Stage Area */}
      <View style={styles.stageWrapper}>
        {room.activeScreenShare !== null ? (
          <View
            style={[
              styles.screenShareLayout,
              isLargeScreen ? styles.screenShareLayoutRow : styles.screenShareLayoutColumn,
            ]}
          >
            <View style={styles.screenShareMainStage}>
              <ScreenShareStage
                screenStream={room.activeScreenShare.stream}
                presenterName={room.activeScreenShare.presenterName}
                isSelfPresenter={room.activeScreenShare.isSelf}
                isFilmstripCollapsed={isFilmstripCollapsed}
                participantCount={currentParticipants.length}
                onToggleFilmstrip={() => setIsFilmstripCollapsed((prev) => !prev)}
                onStopSharing={room.activeScreenShare.isSelf ? room.toggleScreenShare : undefined}
              />
            </View>

            {!isFilmstripCollapsed && currentParticipants.length > 0 && (
              <View
                style={
                  isLargeScreen
                    ? styles.cameraStripContainerVertical
                    : styles.cameraStripContainerHorizontal
                }
              >
                <ScrollView
                  horizontal={!isLargeScreen}
                  style={isLargeScreen ? styles.cameraStripVertical : styles.cameraStripHorizontal}
                  contentContainerStyle={
                    isLargeScreen
                      ? styles.cameraStripContentVertical
                      : styles.cameraStripContentHorizontal
                  }
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                >
                  {currentParticipants.map((p) => renderTileForParticipant(p, 'strip'))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : featuredParticipant !== null && currentParticipants.length > 1 ? (
          <View
            style={[
              styles.screenShareLayout,
              isLargeScreen ? styles.screenShareLayoutRow : styles.screenShareLayoutColumn,
            ]}
          >
            <View style={styles.screenShareMainStage}>
              {renderTileForParticipant(featuredParticipant, 'solo')}
            </View>
            <View
              style={
                isLargeScreen
                  ? styles.cameraStripContainerVertical
                  : styles.cameraStripContainerHorizontal
              }
            >
              <ScrollView
                horizontal={!isLargeScreen}
                style={isLargeScreen ? styles.cameraStripVertical : styles.cameraStripHorizontal}
                contentContainerStyle={
                  isLargeScreen
                    ? styles.cameraStripContentVertical
                    : styles.cameraStripContentHorizontal
                }
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                {currentParticipants
                  .filter((p) => p.userId !== featuredParticipant.userId)
                  .map((p) => renderTileForParticipant(p, 'strip'))}
              </ScrollView>
            </View>
          </View>
        ) : isTwoPersonFloatingView && remoteInPair !== null && selfInPair !== null ? (
          <View style={styles.pairStage}>
            {renderTileForParticipant(remoteInPair, 'solo')}
            <View style={styles.floatingSelfCorner}>
              {renderTileForParticipant(selfInPair, 'floating')}
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.videoGrid}>
            {currentParticipants.map((p) =>
              renderTileForParticipant(p, currentParticipants.length === 1 ? 'solo' : 'grid')
            )}
          </ScrollView>
        )}

        {/* Right Sidebars (Docked on large desktop, Overlay on smaller screens) */}
        {isPeopleOpen && (
          <View style={isLargeScreen ? styles.dockedSidebar : styles.overlaySidebar}>
            <InMeetingParticipantsSidebar
              visible={isPeopleOpen}
              onClose={() => setIsPeopleOpen(false)}
              isHostOrAdmin={room.isHostOrAdmin}
              hostUserId={activeMeeting.hostUserId}
              currentUserId={currentUserId}
              inCallParticipants={currentParticipants}
              allInvitedParticipants={room.allKnownParticipants}
              waitingRequests={room.waitingRequests}
              peerMediaStates={room.peerMediaStates}
              speakingUserIds={room.speakingUserIds}
              spotlightedUserId={room.spotlightedUserId}
              isSelfMicMuted={room.isMicMuted}
              isSelfVideoMuted={room.isVideoMuted}
              onOpenInviteModal={() => setIsInviteOpen(true)}
              onAdmitWaiting={(req) => void room.admitWaitingParticipant(req)}
              onAdmitAllWaiting={() => void room.admitAllWaitingParticipants()}
              onDenyWaiting={(req) => void room.denyWaitingParticipant(req)}
              onMuteParticipant={(uId) => void room.muteParticipant(uId)}
              onMuteAll={() => void room.muteAllParticipants()}
              onSpotlightParticipant={(uId) => void room.spotlightParticipant(uId)}
              onKickParticipant={(uId) => void room.kickParticipant(uId)}
            />
          </View>
        )}

        {isPollsOpen && (
          <View style={isLargeScreen ? styles.dockedSidebar : styles.overlaySidebar}>
            <InMeetingPollsSidebar
              visible={isPollsOpen}
              onClose={() => setIsPollsOpen(false)}
              isHostOrAdmin={room.isHostOrAdmin}
              currentUserId={currentUserId}
              polls={room.polls}
              onOpenCreatePoll={() => setIsCreatePollOpen(true)}
              onVotePoll={(pollId, idx) => void room.votePoll(pollId, idx)}
              onClosePoll={(pollId) => void room.closePoll(pollId)}
            />
          </View>
        )}

        {room.isChatOpen && (
          <View style={isLargeScreen ? styles.dockedSidebar : styles.overlaySidebar}>
            <InMeetingChatSidebar
              meetingCode={activeMeeting.meetingCode}
              currentUserName={currentUserName}
              visible={room.isChatOpen}
              messages={room.chatMessages}
              onSendMessage={room.sendChatMessage}
              onEditMessage={room.editChatMessage}
              onUnsendMessage={room.unsendChatMessage}
              onReactMessage={room.reactToChatMessage}
              onClose={() => room.setIsChatOpen(false)}
            />
          </View>
        )}
      </View>

      <FloatingReactionsOverlay
        reactions={room.floatingEmojis}
        onReactionComplete={room.dismissReaction}
      />

      <MeetingControlsBar
        isHost={room.isHost}
        isMicMuted={room.isMicMuted}
        isVideoMuted={room.isVideoMuted}
        isHandRaised={room.isHandRaised}
        isScreenSharing={room.isScreenSharing}
        isRecording={room.isRecording}
        isPeopleOpen={isPeopleOpen}
        isPollsOpen={isPollsOpen}
        isChatOpen={room.isChatOpen}
        participantCount={currentParticipants.length}
        waitingCount={room.isHostOrAdmin ? room.waitingRequests.length : 0}
        openPollCount={openPollCount}
        unreadChatCount={room.unreadChatCount}
        onToggleMic={room.toggleMic}
        onToggleVideo={room.toggleVideo}
        onToggleHandRaise={() => void room.toggleHandRaise()}
        onToggleScreenShare={() => void room.toggleScreenShare()}
        onToggleRecording={
          room.isHostOrAdmin && room.isRecordingSupported ? room.toggleRecording : undefined
        }
        onOpenDeviceSettings={() => {
          void room.refreshDevices();
          setIsDeviceSettingsOpen(true);
        }}
        onReact={(emoji) => void room.triggerReaction(emoji)}
        onTogglePeople={() => handleToggleSidebar('people')}
        onTogglePolls={() => handleToggleSidebar('polls')}
        onToggleChat={() => handleToggleSidebar('chat')}
        onLeave={() => void handleLeaveCall()}
        onEndMeetingForEveryone={room.isHost ? () => void handleEndCallForAll() : undefined}
      />

      <InMeetingPollModal
        visible={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onSubmit={handleCreatePoll}
        isSubmitting={isSubmitting}
      />

      <InviteParticipantModal
        visible={isInviteOpen}
        meeting={activeMeeting}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        onRemoveParticipant={room.isHostOrAdmin ? handleRemoveParticipant : undefined}
        isSubmitting={isSubmitting}
      />

      <DeviceSettingsModal
        visible={isDeviceSettingsOpen}
        onClose={() => setIsDeviceSettingsOpen(false)}
        microphones={room.microphones}
        cameras={room.cameras}
        speakers={room.speakers}
        selectedMicId={room.selectedMicId}
        selectedCameraId={room.selectedCameraId}
        selectedSpeakerId={room.selectedSpeakerId}
        onSelectMic={room.setSelectedMicId}
        onSelectCamera={room.setSelectedCameraId}
        onSelectSpeaker={room.setSelectedSpeakerId}
      />

      {/* Existing Session Device Switch Modal */}
      <Modal
        visible={room.showExistingSessionModal}
        transparent
        animationType="fade"
        onRequestClose={() => room.setShowExistingSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.sessionModalCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sessionModalIcon}>
              <Icon name="monitor" size={28} color={colors.brand.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>
              Already Joined on Another Device
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted, textAlign: 'center' }]}>
              You have an active session in this meeting on another tab or device. Switch here?
            </Text>
            <View style={styles.sessionModalActions}>
              <Button
                variant="primary"
                size="md"
                onPress={async () => {
                  room.setShowExistingSessionModal(false);
                  await realTimeService.switchDevice(activeMeeting.meetingCode);
                  showToast('Switched session to this device.', 'success');
                }}
              >
                Switch to This Device
              </Button>
              <Button
                variant="outline"
                size="md"
                onPress={() => {
                  room.setShowExistingSessionModal(false);
                  void handleLeaveCall();
                }}
              >
                Leave Here
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  roomContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
  },
  toastWrapper: {
    position: 'absolute',
    top: 16,
    zIndex: 9999,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    zIndex: 50,
    flexWrap: 'wrap',
    gap: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 260,
  },
  meetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  meetingBadgeText: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '600',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  durationText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },
  economyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  economyText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '600',
  },
  layoutSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  layoutSwitchText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  nativeInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59,130,246,0.3)',
  },
  nativeInfoText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
  },
  waitingRoomHostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 45,
  },
  waitingRoomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingBadgePulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingRoomBannerText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  waitingRoomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pendingUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingUserName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 120,
  },
  admitBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  admitBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  denyBtn: {
    padding: 3,
  },
  stageWrapper: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  pairStage: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingSelfCorner: {
    position: 'absolute',
    right: 24,
    bottom: 20,
    zIndex: 25,
  },
  videoGrid: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    alignContent: 'center',
    justifyContent: 'center',
  },
  screenShareLayout: {
    flex: 1,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  screenShareLayoutRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  screenShareLayoutColumn: {
    flexDirection: 'column',
  },
  screenShareMainStage: {
    flex: 1,
    minWidth: 0,
    minHeight: 240,
    justifyContent: 'center',
  },
  cameraStripContainerVertical: {
    width: 204,
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: '100%',
    justifyContent: 'center',
  },
  cameraStripContainerHorizontal: {
    height: 118,
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },
  cameraStripVertical: {
    width: 204,
    flexGrow: 0,
    maxHeight: '100%',
  },
  cameraStripContentVertical: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  cameraStripHorizontal: {
    height: 118,
    width: '100%',
    flexGrow: 0,
  },
  cameraStripContentHorizontal: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  dockedSidebar: {
    width: 320,
    height: '100%',
  },
  overlaySidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 310,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sessionModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  sessionModalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sessionModalActions: {
    width: '100%',
    gap: 8,
    marginTop: 6,
  },
});
