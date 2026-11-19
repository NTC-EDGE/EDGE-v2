import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Avatar, Icon, SHADOWS } from '@edge/ui';
import { useMeetingSession } from '../context/MeetingSessionContext';

interface FloatingMiniCallOverlayProps {
  activeScreen?: string;
  onReturnToMeet: () => void;
}

export const FloatingMiniCallOverlay: React.FC<FloatingMiniCallOverlayProps> = ({
  activeScreen,
  onReturnToMeet,
}) => {
  const session = useMeetingSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeMeeting = session?.activeMeeting ?? null;
  const room = session?.room ?? null;

  const isVisible = activeMeeting !== null && room !== null && activeScreen !== 'Meet';

  // Pick active speaker or remote participant stream (fallback to self)
  const featured =
    room?.activeConnectedParticipants.find(
      (p) => room.speakingUserIds.includes(p.userId)
    ) ??
    room?.activeConnectedParticipants.find((p) => p.userId !== activeMeeting?.hostUserId) ??
    room?.activeConnectedParticipants[0] ??
    null;

  const streamToDisplay =
    room === null
      ? null
      : room.activeScreenShare?.stream ??
        (featured && room.remoteStreams[featured.userId]
          ? room.remoteStreams[featured.userId]
          : room.localStream);

  useEffect(() => {
    if (Platform.OS === 'web' && isVisible && videoRef.current && streamToDisplay) {
      if (videoRef.current.srcObject !== streamToDisplay) {
        videoRef.current.srcObject = streamToDisplay;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible, streamToDisplay]);

  if (!isVisible || activeMeeting === null || room === null) {
    return null;
  }

  const hasVideo =
    streamToDisplay !== null &&
    streamToDisplay.getVideoTracks().some((t) => t.enabled && t.readyState !== 'ended');

  return (
    <View style={[styles.floatingCard, SHADOWS.modal]}>
      <Pressable style={styles.videoArea} onPress={onReturnToMeet}>
        {Platform.OS === 'web' && streamToDisplay !== null ? (
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && streamToDisplay && el.srcObject !== streamToDisplay) {
                el.srcObject = streamToDisplay;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            playsInline
            muted={streamToDisplay === room.localStream}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: hasVideo ? 1 : 0,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : null}

        {!hasVideo && (
          <View style={styles.avatarCenter}>
            <Avatar name={featured?.fullName ?? activeMeeting.title} size="md" />
          </View>
        )}

        <View style={styles.topOverlay}>
          <View style={styles.liveTag}>
            <View style={[styles.liveDot, room.isAnyRecordingActive && { backgroundColor: '#EF4444' }]} />
            <Text style={styles.liveText}>{room.formattedCallDuration}</Text>
          </View>
          <View style={styles.expandChip}>
            <Icon name="maximize-2" size={11} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>

      <View style={styles.bottomBar}>
        <Text style={styles.titleText} numberOfLines={1}>
          {activeMeeting.title}
        </Text>
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.ctrlBtn, room.isMicMuted && styles.ctrlBtnMuted]}
            onPress={room.toggleMic}
            accessibilityLabel="Toggle microphone"
          >
            <Icon name={room.isMicMuted ? 'mic-off' : 'mic'} size={13} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={[styles.ctrlBtn, room.isVideoMuted && styles.ctrlBtnMuted]}
            onPress={room.toggleVideo}
            accessibilityLabel="Toggle camera"
          >
            <Icon name={room.isVideoMuted ? 'video-off' : 'video'} size={13} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={styles.ctrlBtnPrimary}
            onPress={onReturnToMeet}
            accessibilityLabel="Return to full meeting screen"
          >
            <Icon name="external-link" size={13} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={styles.ctrlBtnHangup}
            onPress={() => void session?.leaveActiveMeeting()}
            accessibilityLabel="Leave meeting"
          >
            <Icon name="phone-off" size={13} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingCard: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 260,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.45)',
    overflow: 'hidden',
    zIndex: 9998,
  },
  videoArea: {
    width: '100%',
    height: 138,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  expandChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: '#1E293B',
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  ctrlBtn: {
    flex: 1,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnMuted: {
    backgroundColor: '#DC2626',
  },
  ctrlBtnPrimary: {
    flex: 1,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnHangup: {
    flex: 1,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
