import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Meeting, meetService, safeAsync } from '@edge/api';
import { AlertToast } from '@edge/ui';
import { useMeetingRoom } from '../hooks/useMeetingRoom';
import { VideoTile } from './VideoTile';
import { MeetingControlsBar } from './MeetingControlsBar';
import { FloatingReactionsOverlay } from './FloatingReactionsOverlay';
import { InMeetingChatSidebar } from './InMeetingChatSidebar';
import { InMeetingPollModal } from '../forms/InMeetingPollModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { CreatePollFormValues } from '../schemas/meetSchemas';

interface ActiveMeetingRoomProps {
  meeting: Meeting;
  onLeave: () => void;
}

export const ActiveMeetingRoom: React.FC<ActiveMeetingRoomProps> = ({ meeting: initialMeeting, onLeave }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [isPollOpen, setIsPollOpen] = useState<boolean>(false);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const {
    isMicMuted,
    isVideoMuted,
    isHandRaised,
    isScreenSharing,
    floatingEmojis,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
    triggerReaction,
  } = useMeetingRoom(meeting);

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
    if (err !== null) { showToast(err, 'error'); return; }
    if (poll !== null) showToast('Live poll published to all participants.', 'success');
  };

  const handleInvite = async (userIds: string[]) => {
    setIsSubmitting(true);
    const [updated, err] = await safeAsync(meetService.inviteParticipants(meeting.meetingCode, userIds));
    setIsSubmitting(false);
    if (err !== null) { showToast(err, 'error'); return; }
    if (updated !== null) {
      setMeeting(updated);
      showToast(`Invited ${userIds.length} colleague(s) successfully.`, 'success');
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    setIsSubmitting(true);
    const [success, err] = await safeAsync(meetService.removeParticipant(meeting.meetingCode, userId));
    setIsSubmitting(false);
    if (err !== null) { showToast(err, 'error'); return; }
    if (success) {
      setMeeting((prev) => ({ ...prev, participants: prev.participants.filter((p) => p.userId !== userId) }));
      showToast('Participant removed from meeting.', 'success');
    }
  };

  return (
    <View style={styles.roomContainer}>
      {toast !== null && (
        <View style={styles.toastWrapper}>
          <AlertToast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
        </View>
      )}

      <View style={styles.stageWrapper}>
        <View style={styles.videoGrid}>
          {meeting.participants.map((p) => (
            <VideoTile key={p.userId} participant={p} />
          ))}
        </View>

        {isChatOpen ? (
          <View style={isLargeScreen ? styles.dockedChat : styles.overlayChat}>
            <InMeetingChatSidebar visible={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </View>
        ) : null}
      </View>

      <FloatingReactionsOverlay reactions={floatingEmojis} />

      <MeetingControlsBar
        isMicMuted={isMicMuted}
        isVideoMuted={isVideoMuted}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleHandRaise={toggleHandRaise}
        onToggleScreenShare={toggleScreenShare}
        onReact={triggerReaction}
        onOpenPoll={() => setIsPollOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onLeave={onLeave}
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
    </View>
  );
};

const styles = StyleSheet.create({
  roomContainer: { flex: 1, width: '100%', height: '100%', backgroundColor: '#0F172A', overflow: 'hidden', position: 'relative' },
  toastWrapper: { position: 'absolute', top: 16, zIndex: 9999, width: '90%', maxWidth: 500, alignSelf: 'center' },
  stageWrapper: { flex: 1, flexDirection: 'row', position: 'relative' },
  videoGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, alignContent: 'center', justifyContent: 'center' },
  dockedChat: { width: 320, height: '100%' },
  overlayChat: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, zIndex: 100 },
});
