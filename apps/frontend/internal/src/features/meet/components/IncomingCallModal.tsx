import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Platform, Pressable } from 'react-native';
import { realTimeService, Meeting } from '@edge/api';
import { Button, Icon, SHADOWS, useTheme } from '@edge/ui';

interface IncomingCallModalProps {
  onAccept?: (meetingCode: string) => void;
  onDecline?: () => void;
}

interface IncomingMeetingPayload {
  meetingCode: string;
  title: string;
  hostUserName: string;
  tenantName?: string | null;
  scheduledStartTime?: string | null;
}

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

  const stopRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
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
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      // Pleasant 2-tone melodic chime
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.00, now + 0.15); // A5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440.00, now); // A4
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);
    } catch {
      // Audio playback restrictions fallback
    }
  }, []);

  useEffect(() => {
    const unsub = realTimeService.onIncomingCall((data: unknown) => {
      if (isIncomingMeeting(data)) {
        setIncomingMeeting(data);
        playChimeTone();
        if (ringIntervalRef.current) {
          clearInterval(ringIntervalRef.current);
        }
        ringIntervalRef.current = setInterval(() => {
          playChimeTone();
        }, 3200);
      }
    });

    return () => {
      unsub();
      stopRingtone();
    };
  }, [playChimeTone, stopRingtone]);

  const handleAccept = () => {
    const code = incomingMeeting?.meetingCode;
    stopRingtone();
    setIncomingMeeting(null);
    if (code !== undefined && code !== null && onAccept) {
      onAccept(code);
    }
  };

  const handleDecline = () => {
    stopRingtone();
    setIncomingMeeting(null);
    if (onDecline) {
      onDecline();
    }
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
            <Icon name="video" size={32} color="#FFFFFF" />
          </View>

          <View style={styles.infoWrapper}>
            <Text style={[styles.badgeText, { color: colors.brand.primary }]}>INCOMING VIDEO CALL</Text>
            <Text style={[styles.meetingTitle, { color: colors.text }]} numberOfLines={1}>
              {incomingMeeting.title}
            </Text>
            <Text style={[styles.hostName, { color: colors.textMuted }]}>
              Host: <Text style={{ color: colors.text, fontWeight: '600' }}>{incomingMeeting.hostUserName}</Text>
            </Text>
            {incomingMeeting.tenantName ? (
              <Text style={[styles.tenantName, { color: colors.textMuted }]}>
                {incomingMeeting.tenantName}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.declineBtn} onPress={handleDecline} accessibilityLabel="Decline call">
              <Icon name="phone-off" size={20} color="#FFFFFF" />
              <Text style={styles.btnText}>Decline</Text>
            </Pressable>

            <Pressable style={styles.acceptBtn} onPress={handleAccept} accessibilityLabel="Accept and join call">
              <Icon name="video" size={20} color="#FFFFFF" />
              <Text style={styles.btnText}>Join Call</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 99999,
  },
  callCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  callerIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  pulseRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  infoWrapper: {
    alignItems: 'center',
    gap: 6,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginTop: 8,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
    }),
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
