import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Avatar, Icon, useTheme } from '@edge/ui';
import { MeetingParticipant } from '@edge/api';

interface VideoTileProps {
  participant: MeetingParticipant;
  stream?: MediaStream | null;
  isSelf?: boolean;
  isVideoMuted?: boolean;
  isMicMuted?: boolean;
  isSpeaking?: boolean;
  totalParticipants?: number;
  layoutMode?: 'grid' | 'solo' | 'strip';
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream = null,
  isSelf = false,
  isVideoMuted = false,
  isMicMuted = false,
  isSpeaking = false,
  totalParticipants = 1,
  layoutMode = 'grid',
}) => {
  const { colors } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');

  const hasVideoTrack = stream !== null && stream.getVideoTracks().length > 0 && !isVideoMuted;

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          // Autoplay policy handled
        });
      }
    }
  }, [stream, hasVideoTrack]);

  const toggleFitMode = () => {
    setFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'));
  };

  const isSolo = totalParticipants <= 1;

  const getContainerLayout = () => {
    if (layoutMode === 'strip') {
      return styles.containerStrip;
    }
    return isSolo ? styles.containerSolo : styles.containerGrid;
  };

  return (
    <View
      style={[
        styles.container,
        getContainerLayout(),
        {
          backgroundColor: '#0F172A',
          borderColor: isSpeaking ? '#22C55E' : 'rgba(255, 255, 255, 0.1)',
          borderWidth: isSpeaking ? 2 : 1,
        },
      ]}
    >
      {/* Live Video Stream on Web */}
      {Platform.OS === 'web' && stream !== null && hasVideoTrack ? (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <video
          ref={(el: HTMLVideoElement | null) => {
            videoRef.current = el;
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
            }
          }}
          autoPlay
          playsInline
          muted={isSelf}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            objectPosition: 'center 35%',
            transform: isSelf ? 'scaleX(-1)' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 14,
            backgroundColor: '#090D16',
          }}
        />
      ) : (
        <View style={styles.centerAvatar}>
          <Avatar name={participant.fullName} size="lg" />
          <View style={styles.camOffBadge}>
            <Icon name="video-off" size={13} color="#94A3B8" />
            <Text style={styles.camOffText}>Camera off</Text>
          </View>
        </View>
      )}

      {/* Top Floating Controls Bar */}
      <View style={styles.topControlRow}>
        {isSpeaking ? (
          <View style={styles.speakingTag}>
            <View style={styles.greenPulse} />
            <Text style={styles.speakingText}>Speaking</Text>
          </View>
        ) : <View />}

        {hasVideoTrack && Platform.OS === 'web' && (
          <Pressable
            style={styles.fitToggleBtn}
            onPress={toggleFitMode}
            accessibilityLabel="Toggle video fit mode"
          >
            <Icon name={fitMode === 'cover' ? 'maximize-2' : 'minimize-2'} size={12} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Bottom Information Overlay Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.nameTagWrapper}>
          <Text style={styles.nameTag} numberOfLines={1}>
            {participant.fullName} {isSelf ? '(You)' : ''}
          </Text>
        </View>

        <View style={styles.iconRow}>
          {participant.isHandRaised ? (
            <View style={styles.handBadge}>
              <Text style={styles.handText}>✋ #{participant.handRaiseQueuePosition ?? 1}</Text>
            </View>
          ) : null}
          {isMicMuted || participant.isMutedByHost ? (
            <View style={styles.micMutedBadge}>
              <Icon name="mic-off" size={12} color="#EF4444" />
            </View>
          ) : (
            <View style={[styles.micActiveBadge, isSpeaking && styles.micSpeakingBadge]}>
              <Icon name="mic" size={12} color={isSpeaking ? '#22C55E' : '#94A3B8'} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      },
    }),
  },
  containerSolo: {
    width: '100%',
    maxWidth: 880,
    maxHeight: '100%',
    alignSelf: 'center',
  },
  containerGrid: {
    flexGrow: 1,
    minWidth: 280,
    maxWidth: 620,
  },
  containerStrip: {
    width: '100%',
    minWidth: 160,
    maxWidth: 280,
    aspectRatio: 16 / 9,
  },
  centerAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  camOffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  camOffText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  topControlRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  speakingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22C55E',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  speakingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fitToggleBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  nameTagWrapper: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: '75%',
  },
  nameTag: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  handBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  micMutedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  micActiveBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  micSpeakingBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: '#22C55E',
  },
});
