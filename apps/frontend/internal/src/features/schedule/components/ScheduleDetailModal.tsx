import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
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

interface ScheduleDetailModalProps {
  schedule: ScheduleItemDto | null;
  onClose: () => void;
  onEdit: (schedule: ScheduleItemDto) => void;
}

export function ScheduleDetailModal({
  schedule,
  onClose,
  onEdit,
}: ScheduleDetailModalProps) {
  const { colors, isDark } = useTheme();

  if (schedule === null || schedule === undefined) return null;

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

  const examDateRange = formatLongDateRange(
    schedule.startDate,
    schedule.endDate
  );
  const filingPeriodRange = formatLongDateRange(
    schedule.startApplication,
    schedule.endApplication
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
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
          <View
            style={[
              styles.header,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.headerIconBox,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                  },
                ]}
              >
                <Lucide
                  name="calendar"
                  size={18}
                  color={isDark ? colors.brand[500] : colors.brand.primary}
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Examination Session Details
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                  Schedule ID: {schedule.id}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={onClose}
            >
              <Lucide name="x" size={16} color={colors.text} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Strip */}
            <View
              style={[
                styles.statusStrip,
                {
                  backgroundColor: schedule.isPublished
                    ? COLORS.semantic.successBg
                    : isDark
                    ? colors.neutral[800]
                    : colors.neutral[100],
                  borderColor: schedule.isPublished
                    ? COLORS.semantic.successBorder
                    : colors.border,
                },
              ]}
            >
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: schedule.isPublished
                        ? COLORS.semantic.success
                        : colors.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusTitle,
                    {
                      color: schedule.isPublished
                        ? COLORS.semantic.successText
                        : colors.textMuted,
                    },
                  ]}
                >
                  {schedule.isPublished
                    ? 'Published & Live on Public Services Portal'
                    : 'Internal Draft Mode (Hidden from Public)'}
                </Text>
              </View>
            </View>

            {/* Service & Venue Card */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  TARGET SERVICE
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {schedule.serviceName || 'General Examination'}
                </Text>
                {schedule.serviceCode && (
                  <Text style={[styles.infoCode, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    Code: {schedule.serviceCode}
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  TESTING VENUE / LOCATION
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {schedule.venue}
                </Text>
              </View>
            </View>

            {/* Date Timelines */}
            <View style={styles.twoColumnGrid}>
              <View
                style={[
                  styles.timelineBox,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lucide name="clock" size={16} color={isDark ? colors.brand[500] : colors.brand.primary} />
                <Text style={[styles.timelineLabel, { color: colors.textMuted }]}>
                  EXAMINATION SCHEDULE
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {examDateRange}
                </Text>
              </View>

              <View
                style={[
                  styles.timelineBox,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lucide name="file-text" size={16} color={COLORS.semantic.warning} />
                <Text style={[styles.timelineLabel, { color: colors.textMuted }]}>
                  FILING PERIOD
                </Text>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  {filingPeriodRange}
                </Text>
              </View>
            </View>

            {/* Slots and Remarks */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  MAXIMUM CANDIDATE CAPACITY
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {typeof schedule.maximumSlots === 'number'
                    ? `${schedule.maximumSlots} Maximum Slots`
                    : 'Unlimited Candidate Slots'}
                </Text>
              </View>

              {schedule.remarks && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                      SPECIAL REMARKS & INSTRUCTIONS
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {schedule.remarks}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            <Button
              variant="outline"
              fullWidth={false}
              style={styles.closeButtonAction}
              onPress={onClose}
            >
              Close
            </Button>
            {!schedule.isPublished && (
              <Button
                variant="primary"
                fullWidth={false}
                style={styles.editButtonAction}
                leftIcon={<Lucide name="edit-3" size={14} color={COLORS.neutral.white} />}
                onPress={() => {
                  onClose();
                  onEdit(schedule);
                }}
              >
                Edit Schedule
              </Button>
            )}
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
    maxWidth: 580,
    maxHeight: '90%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  infoCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
  },
  infoRow: {
    gap: 3,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  infoCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  timelineBox: {
    flex: 1,
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 4,
  },
  timelineLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  timelineValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  timelineSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
  },
  closeButtonAction: {
    minWidth: 90,
    paddingHorizontal: SPACING[16],
  },
  editButtonAction: {
    minWidth: 140,
    paddingHorizontal: SPACING[16],
  },
});
