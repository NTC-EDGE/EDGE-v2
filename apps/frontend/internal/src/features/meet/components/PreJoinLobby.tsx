import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { Meeting, realTimeService } from '@edge/api';
import { Avatar, Button, Icon, useTheme } from '@edge/ui';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { InitialJoinPreferences } from '../hooks/useMeetingRoom';
import { DeviceSettingsModal } from '../forms/DeviceSettingsModal';
import { copyTextToClipboard, getMeetingJoinLink, isWebMediaSupported } from '../utils/webDomHelpers';

interface PreJoinLobbyProps {
  meeting: Meeting;
  currentUserId?: string;
  currentUserName?: string;
  onJoinConfirmed: (prefs: InitialJoinPreferences) => void;
  onCancel: () => void;
  onDenied?: (reason: string) => void;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  meeting,
  currentUserId,
  currentUserName,
  onJoinConfirmed,
  onCancel,
  onDenied,
}) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 840;

  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWaitingForHost, setIsWaitingForHost] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<'link' | 'code' | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const {
    microphones,
    cameras,
    speakers,
    selectedMicId,
    selectedCameraId,
    selectedSpeakerId,
    setSelectedMicId,
    setSelectedCameraId,
    setSelectedSpeakerId,
    previewStream,
    previewMicLevel,
    previewError,
  } = useMediaDevices(true, isMicMuted, isVideoMuted);

  const isHost = currentUserId !== undefined && meeting.hostUserId === currentUserId;
  const isInvitedParticipant =
    currentUserId !== undefined && meeting.participants.some((p) => p.userId === currentUserId);
  const canJoinDirectly = isHost || isInvitedParticipant || meeting.scope === 'InterRegional';

  const hasLivePreviewVideo =
    previewStream !== null && previewStream.getVideoTracks().length > 0 && !isVideoMuted;

  useEffect(() => {
    if (Platform.OS === 'web' && previewVideoRef.current && previewStream) {
      if (previewVideoRef.current.srcObject !== previewStream) {
        previewVideoRef.current.srcObject = previewStream;
      }
      previewVideoRef.current.play().catch(() => {});
    }
  }, [previewStream, hasLivePreviewVideo]);

  // Listen for waiting-room admission / denial when "Ask to Join" is active
  useEffect(() => {
    if (!isWaitingForHost) return;

    const unsubAdmitted = realTimeService.onJoinRequestAdmitted((code) => {
      if (code === meeting.meetingCode) {
        setIsWaitingForHost(false);
        onJoinConfirmed({ micMuted: isMicMuted, videoMuted: isVideoMuted });
      }
    });

    const unsubDenied = realTimeService.onJoinRequestDenied((code, reason) => {
      if (code === meeting.meetingCode) {
        setIsWaitingForHost(false);
        onDenied?.(reason || 'Your request to join was declined by the host.');
      }
    });

    const unsubEnded = realTimeService.onMeetingEnded((code) => {
      if (code === meeting.meetingCode) {
        setIsWaitingForHost(false);
        onDenied?.('This meeting has ended.');
      }
    });

    return () => {
      unsubAdmitted();
      unsubDenied();
      unsubEnded();
    };
  }, [isWaitingForHost, meeting.meetingCode, isMicMuted, isVideoMuted, onJoinConfirmed, onDenied]);

  const handlePrimaryJoin = () => {
    if (canJoinDirectly) {
      onJoinConfirmed({ micMuted: isMicMuted, videoMuted: isVideoMuted });
    } else {
      setIsWaitingForHost(true);
      void realTimeService.requestJoinMeeting(meeting.meetingCode);
    }
  };

  const handleCancelLobby = () => {
    if (isWaitingForHost) {
      void realTimeService.leaveMeeting(meeting.meetingCode);
      setIsWaitingForHost(false);
    }
    onCancel();
  };

  const handleCopy = async (kind: 'link' | 'code') => {
    const text = kind === 'link' ? getMeetingJoinLink(meeting.meetingCode) : meeting.meetingCode;
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedKey(kind);
      setTimeout(() => setCopiedKey(null), 2400);
    }
  };

  return (
    <ScrollView
      style={[styles.outerScroll, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.outerContent}
    >
      <View style={[styles.lobbyContainer, isWide ? styles.lobbyRow : styles.lobbyCol]}>
        {/* Left Column: Camera & Audio Preview */}
        <View style={styles.previewColumn}>
          <View style={styles.previewBox}>
            {Platform.OS === 'web' && previewStream !== null ? (
              <video
                ref={(el) => {
                  previewVideoRef.current = el;
                  if (el && previewStream && el.srcObject !== previewStream) {
                    el.srcObject = previewStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  opacity: hasLivePreviewVideo ? 1 : 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            ) : null}

            {!hasLivePreviewVideo && (
              <View style={styles.avatarFallback}>
                <Avatar name={currentUserName ?? 'You'} size="lg" />
                <Text style={styles.cameraStateLabel}>
                  {!isWebMediaSupported()
                    ? 'Signaling & Chat Mode (Mobile)'
                    : isVideoMuted
                      ? 'Camera is turned off'
                      : previewError || 'Starting camera preview...'}
                </Text>
              </View>
            )}

            {/* Top Left Name & Mic Meter */}
            <View style={styles.previewTopOverlay}>
              <View style={styles.selfBadge}>
                <Text style={styles.selfBadgeText} numberOfLines={1}>
                  {currentUserName ?? 'You'}
                </Text>
              </View>
              {!isMicMuted && isWebMediaSupported() && (
                <View style={styles.micMeterPill}>
                  <Icon name="mic" size={12} color="#22C55E" />
                  <View style={styles.micMeterTrack}>
                    <View
                      style={[
                        styles.micMeterFill,
                        { width: `${Math.max(8, previewMicLevel)}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Floating Hardware Controls */}
            <View style={styles.previewControlsRow}>
              <Pressable
                style={[styles.mediaToggleBtn, isMicMuted && styles.mediaToggleBtnMuted]}
                onPress={() => setIsMicMuted((v) => !v)}
                accessibilityLabel="Toggle microphone before joining"
              >
                <Icon name={isMicMuted ? 'mic-off' : 'mic'} size={18} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={[styles.mediaToggleBtn, isVideoMuted && styles.mediaToggleBtnMuted]}
                onPress={() => setIsVideoMuted((v) => !v)}
                accessibilityLabel="Toggle camera before joining"
              >
                <Icon name={isVideoMuted ? 'video-off' : 'video'} size={18} color="#FFFFFF" />
              </Pressable>

              {isWebMediaSupported() && (
                <Pressable
                  style={styles.deviceGearBtn}
                  onPress={() => setIsSettingsOpen(true)}
                  accessibilityLabel="Choose microphone, camera, and speaker"
                >
                  <Icon name="settings" size={17} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </View>

          {isWebMediaSupported() && (
            <Pressable
              style={[styles.deviceSummaryBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => setIsSettingsOpen(true)}
            >
              <View style={styles.deviceSummaryItem}>
                <Icon name="mic" size={13} color={colors.brand.primary} />
                <Text style={[styles.deviceSummaryText, { color: colors.textMuted }]} numberOfLines={1}>
                  {microphones.find((m) => m.deviceId === selectedMicId)?.label ?? 'Default Mic'}
                </Text>
              </View>
              <View style={styles.deviceSummaryItem}>
                <Icon name="video" size={13} color={colors.brand.primary} />
                <Text style={[styles.deviceSummaryText, { color: colors.textMuted }]} numberOfLines={1}>
                  {cameras.find((c) => c.deviceId === selectedCameraId)?.label ?? 'Default Camera'}
                </Text>
              </View>
              <Icon name="sliders" size={13} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Right Column: Meeting Details & Join Action */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <View style={[styles.scopeBadge, { backgroundColor: colors.brand.primary + '18' }]}>
              <Text style={[styles.scopeBadgeText, { color: colors.brand.primary }]}>
                {meeting.scope === 'InterRegional' ? 'Inter-Regional' : 'Regional Office'}
              </Text>
            </View>
            {meeting.status === 'Live' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE NOW</Text>
              </View>
            )}
          </View>

          <Text style={[styles.meetingTitle, { color: colors.text }]}>{meeting.title}</Text>

          {meeting.description ? (
            <Text style={[styles.meetingDesc, { color: colors.textMuted }]} numberOfLines={3}>
              {meeting.description}
            </Text>
          ) : null}

          <View style={[styles.metaBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={styles.metaItem}>
              <Icon name="user" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                Host: <Text style={{ fontWeight: '700' }}>{meeting.hostUserName}</Text>
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="users" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {meeting.participants.length} invited attendee(s)
              </Text>
            </View>
            <View style={styles.shareCodeRow}>
              <Text style={[styles.codeLabel, { color: colors.text }]}>{meeting.meetingCode}</Text>
              <View style={styles.shareBtns}>
                <Pressable style={styles.miniCopyBtn} onPress={() => void handleCopy('code')}>
                  <Icon name={copiedKey === 'code' ? 'check' : 'copy'} size={12} color={colors.brand.primary} />
                  <Text style={[styles.miniCopyText, { color: colors.brand.primary }]}>
                    {copiedKey === 'code' ? 'Copied' : 'Code'}
                  </Text>
                </Pressable>
                <Pressable style={styles.miniCopyBtn} onPress={() => void handleCopy('link')}>
                  <Icon name={copiedKey === 'link' ? 'check' : 'link'} size={12} color={colors.brand.primary} />
                  <Text style={[styles.miniCopyText, { color: colors.brand.primary }]}>
                    {copiedKey === 'link' ? 'Copied' : 'Link'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {isWaitingForHost ? (
            <View style={[styles.waitingBox, { borderColor: colors.brand.primary + '50', backgroundColor: colors.brand.primary + '12' }]}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <View style={styles.waitingTextWrap}>
                <Text style={[styles.waitingTitle, { color: colors.text }]}>
                  Asking to be let in...
                </Text>
                <Text style={[styles.waitingSub, { color: colors.textMuted }]}>
                  You will join the call automatically once the host admits you.
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.readyHint, { color: colors.textMuted }]}>
              {canJoinDirectly
                ? 'Ready to join? Check your camera and audio settings before entering.'
                : 'You were not directly invited — the host will be notified to admit you from the lobby.'}
            </Text>
          )}

          <View style={styles.actionStack}>
            {!isWaitingForHost && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Icon name="video" size={17} color="#FFFFFF" />}
                onPress={handlePrimaryJoin}
              >
                {canJoinDirectly ? 'Join Now' : 'Ask to Join'}
              </Button>
            )}

            <Button variant="outline" size="md" fullWidth onPress={handleCancelLobby}>
              {isWaitingForHost ? 'Cancel Join Request' : 'Back to Meetings'}
            </Button>
          </View>
        </View>
      </View>

      <DeviceSettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        microphones={microphones}
        cameras={cameras}
        speakers={speakers}
        selectedMicId={selectedMicId}
        selectedCameraId={selectedCameraId}
        selectedSpeakerId={selectedSpeakerId}
        onSelectMic={setSelectedMicId}
        onSelectCamera={setSelectedCameraId}
        onSelectSpeaker={setSelectedSpeakerId}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerScroll: {
    flex: 1,
    width: '100%',
  },
  outerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lobbyContainer: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    gap: 24,
    alignItems: 'stretch',
  },
  lobbyRow: {
    flexDirection: 'row',
  },
  lobbyCol: {
    flexDirection: 'column',
  },
  previewColumn: {
    flex: 1.35,
    gap: 10,
  },
  previewBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallback: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  cameraStateLabel: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  previewTopOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  selfBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  selfBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  micMeterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  micMeterTrack: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  micMeterFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  previewControlsRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  mediaToggleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaToggleBtnMuted: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  deviceGearBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  deviceSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceSummaryText: {
    flex: 1,
    fontSize: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  scopeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scopeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  meetingTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  meetingDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  metaBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
  shareCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    gap: 8,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  shareBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  miniCopyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  waitingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  waitingTextWrap: {
    flex: 1,
    gap: 2,
  },
  waitingTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  waitingSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  readyHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionStack: {
    gap: 10,
    marginTop: 4,
  },
});
