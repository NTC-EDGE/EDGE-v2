import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Button, ConfirmationModal, Icon, useTheme } from '@edge/ui';

interface MeetingControlsBarProps {
  isHost: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isRecording?: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording?: () => void;
  onReact: (emoji: string) => void;
  onOpenPoll: () => void;
  onOpenInvite: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
  onEndMeetingForEveryone?: () => void;
}

export const MeetingControlsBar: React.FC<MeetingControlsBarProps> = ({
  isHost,
  isMicMuted,
  isVideoMuted,
  isHandRaised,
  isScreenSharing,
  isRecording = false,
  onToggleMic,
  onToggleVideo,
  onToggleHandRaise,
  onToggleScreenShare,
  onToggleRecording,
  onReact,
  onOpenPoll,
  onOpenInvite,
  onToggleChat,
  onLeave,
  onEndMeetingForEveryone,
}) => {
  const { colors } = useTheme();
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const handleEndCallClick = () => {
    setShowLeaveModal(true);
  };

  return (
    <View style={styles.outerWrapper}>
      <View style={[styles.floatingBar, { backgroundColor: colors.neutral[900], borderColor: colors.neutral[700] }]}>
        {/* Audio / Video Controls */}
        <Pressable
          style={[styles.btn, isMicMuted ? styles.btnMuted : styles.btnActive]}
          onPress={onToggleMic}
          accessibilityLabel="Toggle Microphone"
        >
          <Icon name={isMicMuted ? 'mic-off' : 'mic'} size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={[styles.btn, isVideoMuted ? styles.btnMuted : styles.btnActive]}
          onPress={onToggleVideo}
          accessibilityLabel="Toggle Camera"
        >
          <Icon name={isVideoMuted ? 'video-off' : 'video'} size={18} color="#FFFFFF" />
        </Pressable>

        {/* Screen Share */}
        <Pressable
          style={[styles.btn, isScreenSharing ? styles.btnSelected : styles.btnActive]}
          onPress={onToggleScreenShare}
          accessibilityLabel="Share Screen"
        >
          <Icon name="monitor" size={18} color="#FFFFFF" />
        </Pressable>

        {/* Recording Toggle (Host Only / Configurable) */}
        {onToggleRecording && (
          <Pressable
            style={[styles.btn, isRecording ? styles.btnRecording : styles.btnActive]}
            onPress={onToggleRecording}
            accessibilityLabel={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <Icon name="circle" size={16} color={isRecording ? '#EF4444' : '#FFFFFF'} />
          </Pressable>
        )}

        {/* Raise Hand */}
        <Pressable
          style={[styles.btn, isHandRaised ? styles.btnHandRaised : styles.btnActive]}
          onPress={onToggleHandRaise}
          accessibilityLabel="Raise Hand"
        >
          <Text style={styles.emojiText}>✋</Text>
        </Pressable>

        {/* Reaction Emojis */}
        <View style={[styles.reactionGroup, { backgroundColor: colors.neutral[800] }]}>
          {['👍', '❤️', '👏', '🎉'].map((emoji) => (
            <Pressable key={emoji} style={styles.emojiBtn} onPress={() => onReact(emoji)}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Invite Participants */}
        <Pressable style={styles.btnActive} onPress={onOpenInvite} accessibilityLabel="Invite Colleagues">
          <Icon name="user-plus" size={18} color="#FFFFFF" />
        </Pressable>

        {/* Polls */}
        <Pressable style={styles.btnActive} onPress={onOpenPoll} accessibilityLabel="Open Polls">
          <Icon name="bar-chart-2" size={18} color="#FFFFFF" />
        </Pressable>

        {/* In-Meeting Chat */}
        <Pressable style={styles.btnActive} onPress={onToggleChat} accessibilityLabel="In-meeting Chat">
          <Icon name="message-square" size={18} color="#FFFFFF" />
        </Pressable>

        {/* Leave Call */}
        <Pressable style={styles.btnEndCall} onPress={handleEndCallClick} accessibilityLabel="Leave Meeting">
          <Icon name="phone-off" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Reusable Confirmation Modal for Leave / End Meeting */}
      {isHost ? (
        <ConfirmationModal
          visible={showLeaveModal}
          title={onEndMeetingForEveryone ? 'End or Leave Meeting?' : 'Leave Meeting?'}
          subtitle={
            isScreenSharing
              ? 'You are hosting this meeting and sharing your screen. Ending will disconnect all participants, and leaving will stop your screen share.'
              : 'As the host, you can end the meeting for all participants or leave the room open.'
          }
          variant="danger"
          confirmText={onEndMeetingForEveryone ? 'End for Everyone' : 'Leave Meeting'}
          cancelText="Cancel"
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={() => {
            setShowLeaveModal(false);
            if (onEndMeetingForEveryone) {
              onEndMeetingForEveryone();
            } else {
              onLeave();
            }
          }}
        >
          {isHost && onEndMeetingForEveryone && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onPress={() => {
                setShowLeaveModal(false);
                onLeave();
              }}
              style={{ marginTop: 6 }}
            >
              Leave Meeting (Keep Room Open)
            </Button>
          )}
        </ConfirmationModal>
      ) : (
        <ConfirmationModal
          visible={showLeaveModal}
          title="Leave Meeting?"
          subtitle={
            isScreenSharing
              ? 'You are currently sharing your screen. Leaving the meeting will stop your screen share and disconnect you from the call.'
              : 'Are you sure you want to leave this meeting?'
          }
          variant={isScreenSharing ? 'warning' : 'info'}
          confirmText="Leave Meeting"
          cancelText="Stay"
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={() => {
            setShowLeaveModal(false);
            onLeave();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    flexWrap: 'wrap',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnMuted: {
    backgroundColor: '#DC2626',
  },
  btnRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnSelected: {
    backgroundColor: '#2563EB',
  },
  btnHandRaised: {
    backgroundColor: '#D97706',
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  emojiBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  emojiText: {
    fontSize: 16,
  },
  btnEndCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
