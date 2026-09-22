import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  Button,
  Icon as Lucide,
} from '@edge/ui';
import { ScheduleItemDto } from '@edge/api';

interface DeleteScheduleModalProps {
  visible: boolean;
  schedule: ScheduleItemDto | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteScheduleModal({
  visible,
  schedule,
  onClose,
  onConfirm,
}: DeleteScheduleModalProps) {
  const { colors, isDark } = useTheme();
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!visible || schedule === null || schedule === undefined) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  const formatLongDate = (isoString?: string | null): string => {
    if (typeof isoString !== 'string' || isoString.trim().length === 0) {
      return '';
    }
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatLongDateRange = (
    start?: string | null,
    end?: string | null
  ): string => {
    const formattedStart = formatLongDate(start);
    const formattedEnd = formatLongDate(end);

    if (
      formattedStart.length > 0 &&
      formattedEnd.length > 0 &&
      formattedStart !== formattedEnd
    ) {
      return `${formattedStart} - ${formattedEnd}`;
    }
    if (formattedStart.length > 0) {
      return formattedStart;
    }
    if (formattedEnd.length > 0) {
      return formattedEnd;
    }
    return 'Not Specified';
  };

  const dateRangeText = formatLongDateRange(
    schedule.startDate,
    schedule.endDate
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.semantic.errorBg }]}>
              <Lucide name="trash-2" size={20} color={COLORS.semantic.error} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                Delete Examination Schedule?
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                This action cannot be undone. Any active applicant bookings or viewings for this slot may be affected.
              </Text>
            </View>
          </View>

          {/* Details Preview */}
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              {schedule.serviceName || 'General Examination'}
            </Text>
            <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
              Venue: {schedule.venue || 'Venue Unassigned'}
            </Text>
            <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
              Schedule: {dateRangeText}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              fullWidth={false}
              style={styles.cancelButton}
              onPress={onClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth={false}
              style={styles.deleteButton}
              leftIcon={<Lucide name="trash-2" size={14} color={COLORS.neutral.white} />}
              onPress={handleConfirm}
              isLoading={isDeleting}
            >
              Delete Permanently
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    padding: SPACING[24],
    gap: SPACING[16],
    ...SHADOWS.modal,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[12],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    lineHeight: 18,
  },
  previewBox: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 4,
  },
  previewTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  previewMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING[12],
    paddingTop: SPACING[8],
  },
  cancelButton: {
    minWidth: 100,
    paddingHorizontal: SPACING[16],
  },
  deleteButton: {
    minWidth: 170,
    paddingHorizontal: SPACING[16],
  },
});
