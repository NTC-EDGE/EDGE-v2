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
import { ScheduleFormData } from '../schemas/scheduleSchema';

export type ScheduleConfirmActionType = 'publish' | 'unpublish' | 'update';

export interface ConfirmModalState {
  visible: boolean;
  type: ScheduleConfirmActionType;
  schedule: ScheduleItemDto | null;
  pendingFormData?: ScheduleFormData | null;
}

interface ConfirmScheduleActionModalProps {
  visible: boolean;
  type: ScheduleConfirmActionType;
  schedule: ScheduleItemDto | null;
  pendingFormData?: ScheduleFormData | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmScheduleActionModal({
  visible,
  type,
  schedule,
  pendingFormData,
  onClose,
  onConfirm,
}: ConfirmScheduleActionModalProps) {
  const { colors, isDark } = useTheme();
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!visible || schedule === null || schedule === undefined) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionConfig = () => {
    switch (type) {
      case 'publish':
        return {
          icon: 'globe' as const,
          iconColor: COLORS.semantic.success,
          iconBg: COLORS.semantic.successBg,
          title: 'Publish Schedule to Portal?',
          description:
            'Publishing will make this examination schedule publicly visible on the portal. Applicants will immediately be able to apply and reserve examination slots.',
          impactWarning:
            'Applicants will see this date and venue when submitting applications.',
          buttonLabel: 'Publish Schedule',
          buttonVariant: 'primary' as const,
        };
      case 'unpublish':
        return {
          icon: 'eye-off' as const,
          iconColor: COLORS.semantic.warning,
          iconBg: COLORS.semantic.warningBg,
          title: 'Unpublish Examination Schedule?',
          description:
            'Unpublishing will revert this schedule to Draft status and hide it from the public portal. Applicants will no longer be able to select or register for this examination.',
          impactWarning:
            'This may affect pending applicant registrations and prevent new applicant bookings.',
          buttonLabel: 'Unpublish (Draft)',
          buttonVariant: 'danger' as const,
        };
      case 'update':
      default:
        return {
          icon: 'alert-triangle' as const,
          iconColor: COLORS.semantic.warning,
          iconBg: COLORS.semantic.warningBg,
          title: 'Confirm Schedule Modifications?',
          description:
            'You are modifying details of an existing examination schedule. Changes to venues, dates, filing deadlines, or slot capacity directly impact applicants.',
          impactWarning:
            'Modifications may affect existing applicants who have already booked slots or received examination notices.',
          buttonLabel: 'Confirm & Save Changes',
          buttonVariant: 'primary' as const,
        };
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

  const formatLongDateRange = (start?: string | null, end?: string | null): string => {
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

  const config = getActionConfig();
  const venueText = pendingFormData?.venue || schedule.venue || 'Venue Unassigned';
  const rawStartDate = pendingFormData?.startDate || schedule.startDate;
  const rawEndDate = pendingFormData?.endDate || schedule.endDate;
  const dateRangeText = formatLongDateRange(rawStartDate, rawEndDate);
  const serviceName = schedule.serviceName || 'General Examination';

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
            <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
              <Lucide name={config.icon} size={20} color={config.iconColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                {config.title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {config.description}
              </Text>
            </View>
          </View>

          {/* Impact Warning Banner */}
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : COLORS.semantic.warningBg,
                borderColor: COLORS.semantic.warning,
              },
            ]}
          >
            <Lucide name="alert-circle" size={16} color={COLORS.semantic.warning} />
            <Text style={[styles.warningText, { color: isDark ? colors.neutral[200] : COLORS.semantic.warningText }]}>
              {config.impactWarning}
            </Text>
          </View>

          {/* Schedule Preview */}
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
              {serviceName}
            </Text>
            <View style={styles.previewRow}>
              <Lucide name="map-pin" size={13} color={colors.textMuted} />
              <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
                {venueText}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Lucide name="calendar" size={13} color={colors.textMuted} />
              <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
                {dateRangeText}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              fullWidth={false}
              style={styles.cancelButton}
              onPress={onClose}
              isDisabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={config.buttonVariant}
              fullWidth={false}
              style={styles.confirmButton}
              leftIcon={
                <Lucide
                  name={config.icon}
                  size={14}
                  color={COLORS.neutral.white}
                />
              }
              onPress={handleConfirm}
              isLoading={isProcessing}
            >
              {config.buttonLabel}
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
    maxWidth: 500,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    lineHeight: 18,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  previewBox: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 8,
  },
  previewTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flex: 1,
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
  confirmButton: {
    minWidth: 160,
    paddingHorizontal: SPACING[16],
  },
});
