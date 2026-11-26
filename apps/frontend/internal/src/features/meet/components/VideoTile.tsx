import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Avatar, Icon } from '@edge/ui';
import { MeetingParticipant } from '@edge/api';
import { applyAudioOutputSink } from '../utils/webDomHelpers';

interface VideoTileProps {
  participant: MeetingParticipant;
  stream?: MediaStream | null;
  isSelf?: boolean;
  isVideoMuted?: boolean;
  isMicMuted?: boolean;
  isSpeaking?: boolean;
  isHandRaised?: boolean;
  isPinned?: boolean;
  isSpotlighted?: boolean;
  canModerate?: boolean;
  speakerDeviceId?: string;
  totalParticipants?: number;
  layoutMode?: 'grid' | 'solo' | 'strip' | 'floating';
  onTogglePin?: () => void;
  onMuteParticipant?: () => void;
  onSpotlightParticipant?: () => void;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream = null,
  isSelf = false,
  isVideoMuted = false,
  isMicMuted = false,
  isSpeaking = false,
  isHandRaised = false,
  isPinned = false,
  isSpotlighted = false,
  canModerate = false,
  speakerDeviceId,
  totalParticipants = 1,
  layoutMode = 'grid',
  onTogglePin,
  onMuteParticipant,
  onSpotlightParticipant,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [, setTrackRevision] = useState<number>(0);

  const liveVideoTracks =
    stream !== null
      ? stream.getVideoTracks().filter((t) => t.readyState !== 'ended')
      : [];
  const hasVideoTrack = liveVideoTracks.length > 0 && !isVideoMuted;
  const isParticipantHandRaised = isSelf ? isHandRaised : participant.isHandRaised;

  useEffect(() => {
    if (Platform.OS !== 'web' || !stream) return;

    const bumpRevision = () => {
      setTrackRevision((r) => r + 1);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay policy handled
        });
      }
    };

    stream.addEventListener('addtrack', bumpRevision);
    stream.addEventListener('removetrack', bumpRevision);
    const tracks = stream.getTracks();
    tracks.forEach((t) => {
      t.addEventListener('unmute', bumpRevision);
      t.addEventListener('mute', bumpRevision);
      t.addEventListener('ended', bumpRevision);
    });

    return () => {
      stream.removeEventListener('addtrack', bumpRevision);
      stream.removeEventListener('removetrack', bumpRevision);
      tracks.forEach((t) => {
        t.removeEventListener('unmute', bumpRevision);
        t.removeEventListener('mute', bumpRevision);
        t.removeEventListener('ended', bumpRevision);
      });
    };
  }, [stream]);

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {
        // Autoplay policy handled
      });
      if (!isSelf && speakerDeviceId) {
        void applyAudioOutputSink(videoRef.current, speakerDeviceId);
      }
    }
  }, [stream, hasVideoTrack, isSelf, speakerDeviceId]);

  const toggleFitMode = () => {
    setFitMode((prev) => (prev === 'cover' ? 'contain' : 'cover'));
  };

  const togglePictureInPicture = async () => {
    if (Platform.OS === 'web' && videoRef.current && typeof document !== 'undefined') {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('[PiP] Picture-in-Picture error:', err);
      }
    }
  };

  const isSolo = totalParticipants <= 1;

  const getContainerLayout = () => {
    if (layoutMode === 'floating') return styles.containerFloating;
    if (layoutMode === 'strip') return styles.containerStrip;
    if (layoutMode === 'solo' || isSolo) return styles.containerSolo;
    if (totalParticipants === 2) return styles.containerPair;
    if (totalParticipants <= 4) return styles.containerQuad;
    return styles.containerGrid;
  };

  return (
    <View
      style={[
        styles.container,
        getContainerLayout(),
        {
          backgroundColor: '#0F172A',
          borderColor: isSpeaking
            ? '#22C55E'
            : isSpotlighted || isPinned
              ? '#3B82F6'
              : 'rgba(255, 255, 255, 0.12)',
          borderWidth: isSpeaking || isSpotlighted || isPinned ? 2 : 1,
        },
      ]}
    >
      {/* Live Video & Audio Stream on Web */}
      {Platform.OS === 'web' && stream !== null ? (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el !== null && stream !== null && el.srcObject !== stream) {
              el.srcObject = stream;
              el.play().catch(() => {
                // Autoplay policy handled
              });
              if (!isSelf && speakerDeviceId) {
                void applyAudioOutputSink(el, speakerDeviceId);
              }
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
            opacity: hasVideoTrack ? 1 : 0,
            pointerEvents: hasVideoTrack ? 'auto' : 'none',
            zIndex: 1,
          }}
        />
      ) : null}

      {/* Avatar Fallback View when Camera is Off */}
      {(!hasVideoTrack || stream === null) && (
        <View style={[styles.centerAvatar, { zIndex: 2 }]}>
          <Avatar
            name={participant.fullName}
            size={layoutMode === 'floating' || layoutMode === 'strip' ? 'md' : 'lg'}
          />
          {layoutMode !== 'floating' && layoutMode !== 'strip' && (
            <View style={styles.camOffBadge}>
              <Icon name="video-off" size={12} color="#94A3B8" />
              <Text style={styles.camOffText}>Camera off</Text>
            </View>
          )}
        </View>
      )}

      {/* Top Floating Controls & Badges Bar */}
      <View style={[styles.topControlRow, { zIndex: 3 }]}>
        <View style={styles.topLeftBadges}>
          {isSpeaking ? (
            <View style={styles.speakingTag}>
              <View style={styles.greenPulse} />
              <Text style={styles.speakingText}>Speaking</Text>
            </View>
          ) : null}
          {isSpotlighted ? (
            <View style={styles.spotlightTag}>
              <Icon name="star" size={10} color="#FBBF24" />
              <Text style={styles.spotlightText}>Spotlight</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.topActionsGroup}>
          {isParticipantHandRaised ? (
            <View style={styles.upperRightHandBadge}>
              <Text style={styles.handText}>
                ✋ {participant.handRaiseQueuePosition ? `#${participant.handRaiseQueuePosition}` : ''}
              </Text>
            </View>
          ) : null}

          {layoutMode !== 'floating' && onTogglePin ? (
            <Pressable
              style={[styles.fitToggleBtn, isPinned && styles.pinnedBtn]}
              onPress={onTogglePin}
              accessibilityLabel={isPinned ? 'Unpin participant' : 'Pin participant'}
            >
              <Icon name="anchor" size={11} color="#FFFFFF" />
            </Pressable>
          ) : null}

          {layoutMode !== 'floating' && canModerate && !isSelf && onSpotlightParticipant ? (
            <Pressable
              style={[styles.fitToggleBtn, isSpotlighted && styles.spotlightBtnActive]}
              onPress={onSpotlightParticipant}
              accessibilityLabel="Spotlight participant for everyone"
            >
              <Icon name="star" size={11} color="#FFFFFF" />
            </Pressable>
          ) : null}

          {layoutMode !== 'floating' && canModerate && !isSelf && !isMicMuted && onMuteParticipant ? (
            <Pressable
              style={styles.fitToggleBtn}
              onPress={onMuteParticipant}
              accessibilityLabel="Mute participant microphone"
            >
              <Icon name="mic-off" size={11} color="#FCA5A5" />
            </Pressable>
          ) : null}

          {layoutMode !== 'floating' && hasVideoTrack && Platform.OS === 'web' && (
            <>
              <Pressable
                style={styles.fitToggleBtn}
                onPress={() => void togglePictureInPicture()}
                accessibilityLabel="Picture in picture"
              >
                <Icon name="airplay" size={11} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.fitToggleBtn}
                onPress={toggleFitMode}
                accessibilityLabel="Toggle video fit mode"
              >
                <Icon name={fitMode === 'cover' ? 'maximize-2' : 'minimize-2'} size={11} color="#FFFFFF" />
              </Pressable>
            </>
          )}
        </View>
      </View>

      {/* Bottom Information Overlay Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.nameTagWrapper}>
          <Text style={styles.nameTag} numberOfLines={1}>
            {participant.fullName} {isSelf ? '(You)' : ''}
          </Text>
        </View>

        <View style={styles.iconRow}>
          {isMicMuted ? (
            <View style={styles.micMutedBadge}>
              <Icon name="mic-off" size={11} color="#EF4444" />
            </View>
          ) : (
            <View style={[styles.micActiveBadge, isSpeaking && styles.micSpeakingBadge]}>
              <Icon name="mic" size={11} color={isSpeaking ? '#22C55E' : '#94A3B8'} />
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
    maxWidth: 960,
    maxHeight: '100%',
    alignSelf: 'center',
  },
  containerPair: {
    flex: 1,
    minWidth: 300,
    maxWidth: 720,
  },
  containerQuad: {
    width: '48%',
    minWidth: 280,
    maxWidth: 620,
  },
  containerGrid: {
    width: '31%',
    minWidth: 240,
    maxWidth: 460,
  },
  containerStrip: {
    width: 196,
    height: 110,
    flexShrink: 0,
    borderRadius: 12,
  },
  containerFloating: {
    width: 210,
    height: 118,
    flexShrink: 0,
    borderRadius: 12,
  },
  centerAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 11,
    fontWeight: '500',
  },
  topControlRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topLeftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  spotlightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: '#FBBF24',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  spotlightText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '700',
  },
  topActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fitToggleBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
  pinnedBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  spotlightBtnActive: {
    backgroundColor: '#D97706',
    borderColor: '#FBBF24',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  nameTagWrapper: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: '78%',
  },
  nameTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upperRightHandBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  handText: {
    color: '#FFFFFF',
    fontSize: 11,
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
