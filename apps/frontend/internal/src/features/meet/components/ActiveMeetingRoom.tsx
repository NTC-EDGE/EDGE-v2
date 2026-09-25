import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, Modal, ScrollView } from 'react-native';
import { Meeting, meetService, safeAsync, realTimeService } from '@edge/api';
import { AlertToast, Button, Icon, useTheme } from '@edge/ui';
import { useMeetingRoom, RecordingAccessPermission } from '../hooks/useMeetingRoom';
import { VideoTile } from './VideoTile';
import { ScreenShareStage } from './ScreenShareStage';
import { MeetingControlsBar } from './MeetingControlsBar';
import { FloatingReactionsOverlay } from './FloatingReactionsOverlay';
import { InMeetingChatSidebar } from './InMeetingChatSidebar';
import { InMeetingPollModal } from '../forms/InMeetingPollModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { CreatePollFormValues } from '../schemas/meetSchemas';

interface PendingJoinRequest {
  connectionId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  meetingCode: string;
}

interface ActiveMeetingRoomProps {
  meeting: Meeting;
  currentUserId?: string;
  currentUserName?: string;
  onLeave: () => void;
}

export const ActiveMeetingRoom: React.FC<ActiveMeetingRoomProps> = ({
  meeting: initialMeeting,
  currentUserId,
  currentUserName,
  onLeave,
}) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [isPollOpen, setIsPollOpen] = useState<boolean>(false);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isRecordingSettingsOpen, setIsRecordingSettingsOpen] = useState<boolean>(false);
  const [showExistingSessionModal, setShowExistingSessionModal] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<PendingJoinRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const {
    isHost,
    isMicMuted,
    isVideoMuted,
    isHandRaised,
    isScreenSharing,
    isRecording,
    formattedRecordingTime,
    recordingAccess,
    setRecordingAccess,
    floatingEmojis,
    localStream,
    screenStream,
    remoteStreams,
    isSpeaking,
    mediaError,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    toggleHandRaise,
    triggerReaction,
    leaveAndResetRoom,
  } = useMeetingRoom(meeting, currentUserId);

  useEffect(() => {
    if (mediaError) {
      showToast(mediaError, 'error');
    }
  }, [mediaError]);

  // Real-time meeting ended listener
  useEffect(() => {
    const unsubEnded = realTimeService.onMeetingEnded((code) => {
      if (code === meeting.meetingCode) {
        showToast('The host has ended this meeting.', 'error');
        leaveAndResetRoom();
        setTimeout(() => {
          onLeave();
        }, 1200);
      }
    });

    const unsubSessionDetected = realTimeService.onExistingSessionDetected((code) => {
      if (code === meeting.meetingCode) {
        setShowExistingSessionModal(true);
      }
    });

    const unsubSessionSwitched = realTimeService.onSessionSwitchedToAnotherDevice((code) => {
      if (code === meeting.meetingCode) {
        showToast('Your session was transferred to another device.', 'error');
        leaveAndResetRoom();
        setTimeout(() => {
          onLeave();
        }, 1200);
      }
    });

    return () => {
      unsubEnded();
      unsubSessionDetected();
      unsubSessionSwitched();
    };
  }, [meeting.meetingCode, leaveAndResetRoom, onLeave]);

  // Real-time host admission listener
  useEffect(() => {
    if (!isHost) return;

    const unsub = realTimeService.onJoinRequested((req) => {
      if (req.meetingCode === meeting.meetingCode) {
        setPendingRequests((prev) => {
          if (prev.some((r) => r.connectionId === req.connectionId)) return prev;
          return [...prev, req];
        });
        showToast(`${req.userName} is in the waiting room.`, 'success');
      }
    });

    return () => {
      unsub();
    };
  }, [isHost, meeting.meetingCode]);

  const handleAdmitParticipant = async (req: PendingJoinRequest) => {
    try {
      const sanitizedUserId = req.userId && req.userId.length > 0 ? req.userId : '00000000-0000-0000-0000-000000000000';
      await realTimeService.admitParticipant(meeting.meetingCode, req.connectionId, sanitizedUserId);
      setPendingRequests((prev) => prev.filter((r) => r.connectionId !== req.connectionId));
      showToast(`Admitted ${req.userName} to the meeting.`, 'success');
    } catch {
      showToast(`Failed to admit ${req.userName}. Please try again.`, 'error');
    }
  };

  const handleDenyParticipant = async (req: PendingJoinRequest) => {
    try {
      const sanitizedUserId = req.userId && req.userId.length > 0 ? req.userId : '00000000-0000-0000-0000-000000000000';
      await realTimeService.denyParticipant(meeting.meetingCode, req.connectionId, sanitizedUserId);
      setPendingRequests((prev) => prev.filter((r) => r.connectionId !== req.connectionId));
      showToast(`Declined join request from ${req.userName}.`, 'error');
    } catch {
      showToast(`Failed to decline ${req.userName}.`, 'error');
    }
  };

  const handleToggleRecording = () => {
    toggleRecording();
    if (!isRecording) {
      showToast('Meeting recording started. All participants have been notified.', 'success');
    } else {
      showToast('Meeting recording stopped and saved.', 'success');
    }
  };

  const handleCreatePoll = async (values: CreatePollFormValues) => {
    setIsSubmitting(true);
    const options = [values.option1, values.option2];
    if (values.option3) options.push(values.option3);

    const [poll, err] = await safeAsync(
      meetService.createPoll({
        meetingCode: meeting.meetingCode,
        question: values.question,
        options,
        isAnonymous: values.isAnonymous,
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (poll !== null) {
      showToast('Live poll published to all participants.', 'success');
    }
  };

  const handleInvite = async (userIds: string[]) => {
    setIsSubmitting(true);
    const [updated, err] = await safeAsync(meetService.inviteParticipants(meeting.meetingCode, userIds));
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (updated !== null) {
      setMeeting(updated);
      showToast(`Invited ${userIds.length} colleague(s) successfully.`, 'success');
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    setIsSubmitting(true);
    const [success, err] = await safeAsync(meetService.removeParticipant(meeting.meetingCode, userId));
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (success) {
      setMeeting((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.userId !== userId),
      }));
      showToast('Participant removed from meeting.', 'success');
    }
  };

  const handleLeaveRoom = () => {
    leaveAndResetRoom();
    onLeave();
  };

  const handleEndMeetingForEveryone = async () => {
    await safeAsync(
      meetService.executeAction({
        meetingCode: meeting.meetingCode,
        actionType: 'EndMeeting',
      })
    );
    leaveAndResetRoom();
    showToast('Meeting ended for all participants.', 'success');
    onLeave();
  };

  // Ensure self participant exists in grid
  const currentParticipants = [...meeting.participants];
  const hasSelfParticipant = currentUserId && currentParticipants.some((p) => p.userId === currentUserId);
  if (!hasSelfParticipant) {
    currentParticipants.unshift({
      userId: currentUserId ?? 'self',
      fullName: currentUserName ?? 'You',
      email: '',
      role: isHost ? 'Owner' : 'Member',
      isMutedByHost: false,
      isHandRaised: isHandRaised,
      isSpotlighted: false,
    });
  }

  return (
    <View style={styles.roomContainer}>
      {toast !== null && (
        <View style={styles.toastWrapper} pointerEvents="box-none">
          <AlertToast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
        </View>
      )}

      {/* Top Meeting Header Bar */}
      <View style={[styles.topBar, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
        <View style={styles.topBarLeft}>
          <Text style={styles.meetingTitleText} numberOfLines={1}>
            {meeting.title}
          </Text>
          <View style={styles.meetingBadge}>
            <Text style={styles.meetingBadgeText}>{meeting.meetingCode}</Text>
          </View>
        </View>

        {isRecording && (
          <Pressable
            style={styles.recordingBanner}
            onPress={() => isHost && setIsRecordingSettingsOpen(true)}
            accessibilityLabel="Recording status"
          >
            <View style={styles.redDot} />
            <Text style={styles.recordingText}>REC {formattedRecordingTime}</Text>
            {isHost && <Icon name="settings" size={12} color="#EF4444" />}
          </Pressable>
        )}

        {isScreenSharing && (
          <View style={styles.screenShareBanner}>
            <Icon name="monitor" size={14} color="#60A5FA" />
            <Text style={styles.screenShareText}>Sharing Screen</Text>
          </View>
        )}
      </View>

      {/* Host Waiting Room Admission Notification Banner */}
      {isHost && pendingRequests.length > 0 && (
        <View style={styles.waitingRoomHostBanner}>
          <View style={styles.waitingRoomBannerLeft}>
            <View style={styles.waitingBadgePulse}>
              <Icon name="users" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.waitingRoomBannerText}>
              {pendingRequests.length === 1
                ? `${pendingRequests[0].userName} is in the waiting room`
                : `${pendingRequests.length} people are in the waiting room`}
            </Text>
          </View>

          <View style={styles.waitingRoomActionsRow}>
            {pendingRequests.map((req) => (
              <View key={req.connectionId} style={styles.pendingUserChip}>
                <Text style={styles.pendingUserName} numberOfLines={1}>
                  {req.userName}
                </Text>
                <Pressable
                  style={styles.admitBtn}
                  onPress={() => handleAdmitParticipant(req)}
                  accessibilityLabel={`Admit ${req.userName}`}
                >
                  <Text style={styles.admitBtnText}>Admit</Text>
                </Pressable>
                <Pressable
                  style={styles.denyBtn}
                  onPress={() => handleDenyParticipant(req)}
                  accessibilityLabel={`Deny ${req.userName}`}
                >
                  <Icon name="x" size={14} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.stageWrapper}>
        {screenStream !== null ? (
          <View style={[styles.screenShareLayout, isLargeScreen ? styles.screenShareLayoutRow : styles.screenShareLayoutColumn]}>
            <View style={styles.screenShareMainStage}>
              <ScreenShareStage
                screenStream={screenStream}
                presenterName={currentUserName ?? 'You'}
                isSelfPresenter={true}
                onStopSharing={toggleScreenShare}
              />
            </View>

            {isLargeScreen ? (
              <ScrollView
                style={styles.cameraStripVertical}
                contentContainerStyle={styles.cameraStripContentVertical}
                showsVerticalScrollIndicator={false}
              >
                {currentParticipants.map((p, index) => {
                  const isSelf = p.userId === currentUserId || p.userId === 'self' || (currentUserId === undefined && index === 0);
                  const remoteStream = remoteStreams[p.userId] ?? null;
                  return (
                    <VideoTile
                      key={p.userId}
                      participant={p}
                      isSelf={isSelf}
                      stream={isSelf ? localStream : remoteStream}
                      isVideoMuted={isSelf ? isVideoMuted : false}
                      isMicMuted={isSelf ? isMicMuted : p.isMutedByHost}
                      isSpeaking={isSelf ? isSpeaking : false}
                      totalParticipants={currentParticipants.length}
                      layoutMode="strip"
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                style={styles.cameraStripHorizontal}
                contentContainerStyle={styles.cameraStripContentHorizontal}
                showsHorizontalScrollIndicator={false}
              >
                {currentParticipants.map((p, index) => {
                  const isSelf = p.userId === currentUserId || p.userId === 'self' || (currentUserId === undefined && index === 0);
                  const remoteStream = remoteStreams[p.userId] ?? null;
                  return (
                    <VideoTile
                      key={p.userId}
                      participant={p}
                      isSelf={isSelf}
                      stream={isSelf ? localStream : remoteStream}
                      isVideoMuted={isSelf ? isVideoMuted : false}
                      isMicMuted={isSelf ? isMicMuted : p.isMutedByHost}
                      isSpeaking={isSelf ? isSpeaking : false}
                      totalParticipants={currentParticipants.length}
                      layoutMode="strip"
                    />
                  );
                })}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.videoGrid}>
            {currentParticipants.map((p, index) => {
              const isSelf = p.userId === currentUserId || p.userId === 'self' || (currentUserId === undefined && index === 0);
              const remoteStream = remoteStreams[p.userId] ?? null;
              return (
                <VideoTile
                  key={p.userId}
                  participant={p}
                  isSelf={isSelf}
                  stream={isSelf ? localStream : remoteStream}
                  isVideoMuted={isSelf ? isVideoMuted : false}
                  isMicMuted={isSelf ? isMicMuted : p.isMutedByHost}
                  isSpeaking={isSelf ? isSpeaking : false}
                  totalParticipants={currentParticipants.length}
                />
              );
            })}
          </View>
        )}

        {isChatOpen ? (
          <View style={isLargeScreen ? styles.dockedChat : styles.overlayChat}>
            <InMeetingChatSidebar
              meetingCode={meeting.meetingCode}
              currentUserName={currentUserName}
              visible={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </View>
        ) : null}
      </View>

      <FloatingReactionsOverlay reactions={floatingEmojis} />

      <MeetingControlsBar
        isHost={isHost}
        isMicMuted={isMicMuted}
        isVideoMuted={isVideoMuted}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleHandRaise={toggleHandRaise}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={isHost ? handleToggleRecording : undefined}
        onReact={triggerReaction}
        onOpenPoll={() => setIsPollOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onLeave={handleLeaveRoom}
        onEndMeetingForEveryone={isHost ? handleEndMeetingForEveryone : undefined}
      />

      <InMeetingPollModal
        visible={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        onSubmit={handleCreatePoll}
        isSubmitting={isSubmitting}
      />

      <InviteParticipantModal
        visible={isInviteOpen}
        meeting={meeting}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        onRemoveParticipant={handleRemoveParticipant}
        isSubmitting={isSubmitting}
      />

      {/* Recording Permissions Modal */}
      <Modal
        visible={isRecordingSettingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRecordingSettingsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsRecordingSettingsOpen(false)}>
          <View
            style={[
              styles.settingsModalCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Recording Permissions</Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              Control who will have access to view and download this meeting recording after it concludes.
            </Text>

            <View style={styles.permissionOptions}>
              {(
                [
                  { id: 'HostOnly', label: 'Host Only', desc: 'Only you can view and share recording.' },
                  { id: 'AllParticipants', label: 'All Participants', desc: 'All invited attendees can view.' },
                  { id: 'Selected', label: 'Selected Colleagues', desc: 'Manually specify access list.' },
                ] as { id: RecordingAccessPermission; label: string; desc: string }[]
              ).map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.permOptionItem,
                    {
                      borderColor: recordingAccess === opt.id ? colors.brand.primary : colors.border,
                      backgroundColor:
                        recordingAccess === opt.id ? colors.brand.primary + '15' : 'transparent',
                    },
                  ]}
                  onPress={() => setRecordingAccess(opt.id)}
                >
                  <Text
                    style={[
                      styles.permLabel,
                      { color: recordingAccess === opt.id ? colors.brand.primary : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={[styles.permSubDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                </Pressable>
              ))}
            </View>

            <Button
              variant="primary"
              size="sm"
              onPress={() => {
                setIsRecordingSettingsOpen(false);
                showToast(`Recording permissions updated: ${recordingAccess}`, 'success');
              }}
            >
              Save Preferences
            </Button>
          </View>
        </Pressable>
      </Modal>

      {/* Existing Session Prompt Modal */}
      <Modal
        visible={showExistingSessionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExistingSessionModal(false)}
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
              You have already joined this meeting from another device. Would you like to switch to this device?
            </Text>
            <View style={styles.sessionModalActions}>
              <Button
                variant="primary"
                size="md"
                onPress={async () => {
                  setShowExistingSessionModal(false);
                  await realTimeService.switchDevice(meeting.meetingCode);
                  showToast('Switched session to this device.', 'success');
                }}
              >
                Switch to this device
              </Button>
              <Button
                variant="secondary"
                size="md"
                onPress={() => {
                  setShowExistingSessionModal(false);
                }}
              >
                Stay on current device
              </Button>
              <Button
                variant="outline"
                size="md"
                onPress={() => {
                  setShowExistingSessionModal(false);
                  handleLeaveRoom();
                }}
              >
                Cancel
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
    zIndex: 50,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  meetingTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 250,
  },
  meetingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  meetingBadgeText: {
    color: '#94A3B8',
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
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  screenShareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  screenShareText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  stageWrapper: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  videoGrid: {
    flex: 1,
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
  },
  screenShareLayoutRow: {
    flexDirection: 'row',
  },
  screenShareLayoutColumn: {
    flexDirection: 'column',
  },
  screenShareMainStage: {
    flex: 1,
    minHeight: 280,
  },
  cameraStripVertical: {
    width: 250,
    maxHeight: '100%',
  },
  cameraStripContentVertical: {
    gap: 10,
    paddingRight: 4,
  },
  cameraStripHorizontal: {
    height: 140,
    width: '100%',
  },
  cameraStripContentHorizontal: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  dockedChat: {
    width: 320,
    height: '100%',
  },
  overlayChat: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  settingsModalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  permissionOptions: {
    gap: 8,
  },
  permOptionItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  permLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  permSubDesc: {
    fontSize: 12,
  },
  waitingRoomHostBanner: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    zIndex: 100,
  },
  waitingRoomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingBadgePulse: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingRoomBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
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
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 8,
  },
  pendingUserName: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 140,
  },
  admitBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  admitBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  denyBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  sessionModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  sessionModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sessionModalActions: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
});
