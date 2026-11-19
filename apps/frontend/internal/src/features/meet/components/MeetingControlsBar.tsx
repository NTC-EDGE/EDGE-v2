import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Button, ConfirmationModal, Icon, useTheme } from '@edge/ui';
import { isScreenShareSupported, isWebMediaSupported } from '../utils/webDomHelpers';

interface MeetingControlsBarProps {
  isHost: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isRecording?: boolean;
  isPeopleOpen?: boolean;
  isPollsOpen?: boolean;
  isChatOpen?: boolean;
  participantCount?: number;
  waitingCount?: number;
  openPollCount?: number;
  unreadChatCount?: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording?: () => void;
  onOpenDeviceSettings?: () => void;
  onReact: (emoji: string) => void;
  onTogglePeople: () => void;
  onTogglePolls: () => void;
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
  isPeopleOpen = false,
  isPollsOpen = false,
  isChatOpen = false,
  participantCount = 1,
  waitingCount = 0,
  openPollCount = 0,
  unreadChatCount = 0,
  onToggleMic,
  onToggleVideo,
  onToggleHandRaise,
  onToggleScreenShare,
  onToggleRecording,
  onOpenDeviceSettings,
  onReact,
  onTogglePeople,
  onTogglePolls,
  onToggleChat,
  onLeave,
  onEndMeetingForEveryone,
}) => {
  const { colors } = useTheme();
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

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

        {/* Screen Share (Web Only) */}
        {isScreenShareSupported() && (
          <Pressable
            style={[styles.btn, isScreenSharing ? styles.btnSelected : styles.btnActive]}
            onPress={onToggleScreenShare}
            accessibilityLabel="Share Screen"
          >
            <Icon name="monitor" size={18} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Local Recording Toggle (Host/Admin on supported Web browsers only) */}
        {onToggleRecording && (
          <Pressable
            style={[styles.btn, isRecording ? styles.btnRecording : styles.btnActive]}
            onPress={onToggleRecording}
            accessibilityLabel={isRecording ? 'Stop & Save Local Recording' : 'Start Local Recording'}
          >
            <Icon name="disc" size={17} color={isRecording ? '#EF4444' : '#FFFFFF'} />
          </Pressable>
        )}

        {/* Audio/Video Device Settings */}
        {isWebMediaSupported() && onOpenDeviceSettings && (
          <Pressable
            style={styles.btnActive}
            onPress={onOpenDeviceSettings}
            accessibilityLabel="Device Settings"
          >
            <Icon name="sliders" size={17} color="#FFFFFF" />
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

        {/* People / Roster Sidebar */}
        <Pressable
          style={[styles.btnActive, isPeopleOpen && styles.btnSelected]}
          onPress={onTogglePeople}
          accessibilityLabel="Participants"
        >
          <Icon name="users" size={17} color="#FFFFFF" />
          <View style={[styles.counterBadge, waitingCount > 0 && styles.warningBadge]}>
            <Text style={styles.counterText}>
              {waitingCount > 0 ? `+${waitingCount}` : String(participantCount)}
            </Text>
          </View>
        </Pressable>

        {/* Polls Sidebar */}
        <Pressable
          style={[styles.btnActive, isPollsOpen && styles.btnSelected]}
          onPress={onTogglePolls}
          accessibilityLabel="Live Polls"
        >
          <Icon name="bar-chart-2" size={17} color="#FFFFFF" />
          {openPollCount > 0 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{openPollCount}</Text>
            </View>
          )}
        </Pressable>

        {/* In-Meeting Chat */}
        <Pressable
          style={[styles.btnActive, isChatOpen && styles.btnSelected]}
          onPress={onToggleChat}
          accessibilityLabel="In-meeting Chat"
        >
          <Icon name="message-square" size={17} color="#FFFFFF" />
          {unreadChatCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.counterText}>{unreadChatCount > 9 ? '9+' : String(unreadChatCount)}</Text>
            </View>
          )}
        </Pressable>

        {/* Leave Call */}
        <Pressable
          style={styles.btnEndCall}
          onPress={() => setShowLeaveModal(true)}
          accessibilityLabel="Leave Meeting"
        >
          <Icon name="phone-off" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {isHost ? (
        <ConfirmationModal
          visible={showLeaveModal}
          title={onEndMeetingForEveryone ? 'End or Leave Meeting?' : 'Leave Meeting?'}
          subtitle={
            isRecording
              ? 'Your local recording will automatically stop and download to your computer before leaving.'
              : 'As the host, you can end the meeting for everyone or leave the room open for remaining participants.'
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
              ? 'You are currently sharing your screen. Leaving will stop your presentation and disconnect you.'
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
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
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
    position: 'relative',
  },
  btnActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  btnMuted: {
    backgroundColor: '#DC2626',
  },
  btnRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
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
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  emojiText: {
    fontSize: 15,
  },
  counterBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBadge: {
    backgroundColor: '#F59E0B',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
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
