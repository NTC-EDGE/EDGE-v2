import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Meeting, realTimeService } from '@edge/api';
import { Button, Icon, useTheme } from '@edge/ui';

interface WaitingRoomModalProps {
  visible: boolean;
  meeting: Meeting | null;
  onAdmitted: () => void;
  onDenied: (reason: string) => void;
  onCancel: () => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  visible,
  meeting,
  onAdmitted,
  onDenied,
  onCancel,
}) => {
  const { colors, isDark } = useTheme();

  const meetingCode = meeting?.meetingCode;

  useEffect(() => {
    if (!visible || !meetingCode) return;

    const unsubAdmitted = realTimeService.onJoinRequestAdmitted((code) => {
      if (code === meetingCode) {
        onAdmitted();
      }
    });

    const unsubDenied = realTimeService.onJoinRequestDenied((code, reason) => {
      if (code === meetingCode) {
        onDenied(reason || 'Your request to join was declined by the host.');
      }
    });

    return () => {
      unsubAdmitted();
      unsubDenied();
    };
  }, [visible, meetingCode, onAdmitted, onDenied]);

  if (!visible || meeting === null) {
    return null;
  }

  const formattedStartTime = meeting.scheduledStartTime
    ? new Date(meeting.scheduledStartTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }]}>
              <Icon name="clock" size={24} color={colors.brand.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Waiting Room</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Waiting for the host to admit you to the meeting...
            </Text>
          </View>

          {/* Meeting Info Card */}
          <View
            style={[
              styles.meetingDetails,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Meeting:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {meeting.title}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Code:</Text>
              <View style={[styles.codeBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
                <Text style={[styles.codeText, { color: colors.text }]}>{meeting.meetingCode}</Text>
              </View>
            </View>

            {meeting.hostUserName ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Host:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{meeting.hostUserName}</Text>
              </View>
            ) : null}

            {formattedStartTime ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Time:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formattedStartTime}</Text>
              </View>
            ) : null}
          </View>

          {/* Animated Spinner & Notice */}
          <View style={styles.spinnerRow}>
            <ActivityIndicator size="small" color={colors.brand.primary} />
            <Text style={[styles.spinnerText, { color: colors.textMuted }]}>
              The host has been notified that you are waiting. You will join automatically when admitted.
            </Text>
          </View>

          {/* Action */}
          <View style={styles.footer}>
            <Button variant="outline" size="md" fullWidth onPress={onCancel}>
              Leave Waiting Room
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  meetingDetails: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    width: 65,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  spinnerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    width: '100%',
    marginTop: 4,
  },
});
