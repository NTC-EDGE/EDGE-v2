import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Platform, Pressable } from 'react-native';
import { realTimeService } from '@edge/api';
import { Icon, SHADOWS, useTheme } from '@edge/ui';
import { createBrowserAudioContext } from '../utils/webDomHelpers';

interface IncomingCallModalProps {
  onAccept?: (meetingCode: string, options?: { audioOnly?: boolean }) => void;
  onDecline?: () => void;
}

interface IncomingMeetingPayload {
  meetingCode: string;
  title: string;
  hostUserName: string;
  tenantName?: string | null;
  scheduledStartTime?: string | null;
}

const RING_TIMEOUT_MS = 35_000;

function isIncomingMeeting(data: unknown): data is IncomingMeetingPayload {
  if (typeof data === 'object' && data !== null) {
    const code = Reflect.get(data, 'meetingCode');
    const title = Reflect.get(data, 'title');
    const host = Reflect.get(data, 'hostUserName');
    return typeof code === 'string' && typeof title === 'string' && typeof host === 'string';
  }
  return false;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ onAccept, onDecline }) => {
  const { colors, isDark } = useTheme();
  const [incomingMeeting, setIncomingMeeting] = useState<IncomingMeetingPayload | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        void audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
  }, []);

  const playChimeTone = useCallback(() => {
    if (Platform.OS !== 'web') return;
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = createBrowserAudioContext();
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(880.0, now + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440.0, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.15);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);
    } catch {
      // Ignore autoplay audio restriction
    }
  }, []);

  useEffect(() => {
    const unsubIncoming = realTimeService.onIncomingCall((data: unknown) => {
      if (!isIncomingMeeting(data)) return;

      stopRingtone();
      setIncomingMeeting(data);
      playChimeTone();

      ringIntervalRef.current = setInterval(() => {
        playChimeTone();
      }, 3200);

      ringTimeoutRef.current = setTimeout(() => {
        stopRingtone();
        setIncomingMeeting(null);
      }, RING_TIMEOUT_MS);
    });

    const unsubEnded = realTimeService.onMeetingEnded((endedCode) => {
      setIncomingMeeting((curr) => {
        if (curr && curr.meetingCode === endedCode) {
          stopRingtone();
          return null;
        }
        return curr;
      });
    });

    return () => {
      unsubIncoming();
      unsubEnded();
      stopRingtone();
    };
  }, [playChimeTone, stopRingtone]);

  const handleAccept = (audioOnly: boolean) => {
    const code = incomingMeeting?.meetingCode;
    stopRingtone();
    setIncomingMeeting(null);
    if (code && onAccept) {
      onAccept(code, { audioOnly });
    }
  };

  const handleDecline = () => {
    const code = incomingMeeting?.meetingCode;
    stopRingtone();
    setIncomingMeeting(null);
    if (code) {
      void realTimeService.declineIncomingCall(code);
    }
    onDecline?.();
  };

  if (incomingMeeting === null) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleDecline}>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.callCard,
            SHADOWS.modal,
            {
              backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.callerIconWrapper}>
            <View style={styles.pulseRing} />
            <Icon name="video" size={30} color="#FFFFFF" />
          </View>

          <View style={styles.infoWrapper}>
            <Text style={[styles.badgeText, { color: colors.brand.primary }]}>INCOMING CALL</Text>
            <Text style={[styles.meetingTitle, { color: colors.text }]} numberOfLines={2}>
              {incomingMeeting.title}
            </Text>
            <Text style={[styles.hostName, { color: colors.textMuted }]}>
              Caller:{' '}
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {incomingMeeting.hostUserName}
              </Text>
            </Text>
            {incomingMeeting.tenantName ? (
              <Text style={[styles.tenantName, { color: colors.textMuted }]}>
                {incomingMeeting.tenantName}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsColumn}>
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.declineBtn}
                onPress={handleDecline}
                accessibilityLabel="Decline call"
              >
                <Icon name="phone-off" size={18} color="#FFFFFF" />
                <Text style={styles.btnText}>Decline</Text>
              </Pressable>

              <Pressable
                style={styles.acceptBtn}
                onPress={() => handleAccept(false)}
                accessibilityLabel="Accept with video"
              >
                <Icon name="video" size={18} color="#FFFFFF" />
                <Text style={styles.btnText}>Join Video</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.audioOnlyBtn, { borderColor: colors.border }]}
              onPress={() => handleAccept(true)}
              accessibilityLabel="Accept with audio only"
            >
              <Icon name="mic" size={15} color={colors.text} />
              <Text style={[styles.audioOnlyText, { color: colors.text }]}>
                Join Audio Only
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 99999,
  },
  callCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  callerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  infoWrapper: {
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  hostName: {
    fontSize: 14,
    textAlign: 'center',
  },
  tenantName: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsColumn: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#EF4444',
    paddingVertical: 11,
    borderRadius: 12,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 12,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  audioOnlyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  audioOnlyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
