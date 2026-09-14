import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import {
  COLORS,
  useTheme,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  AnimatedCard,
  Icon as Lucide,
} from '@edge/ui';
import { ScheduleItemDto } from '@edge/api';

interface ScheduleCardProps {
  schedule: ScheduleItemDto;
  index: number;
  onEdit: (schedule: ScheduleItemDto) => void;
  onTogglePublish: (schedule: ScheduleItemDto) => void;
  onDelete: (schedule: ScheduleItemDto) => void;
  onViewDetails: (schedule: ScheduleItemDto) => void;
}

export function ScheduleCard({
  schedule,
  index,
  onEdit,
  onTogglePublish,
  onDelete,
  onViewDetails,
}: ScheduleCardProps) {
  const { colors, isDark } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (isoString?: string | null): string => {
    if (typeof isoString !== 'string' || isoString.length === 0) {
      return 'N/A';
    }
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const now = new Date().getTime();
  const startTime = new Date(schedule.startDate).getTime();
  const endTime = new Date(schedule.endDate).getTime();

  let timeStatus: 'Upcoming' | 'Ongoing' | 'Completed' = 'Upcoming';
  if (!isNaN(startTime) && !isNaN(endTime)) {
    if (now > endTime) {
      timeStatus = 'Completed';
    } else if (now >= startTime && now <= endTime) {
      timeStatus = 'Ongoing';
    }
  }

  const getTimeStatusBadge = () => {
    switch (timeStatus) {
      case 'Ongoing':
        return {
          bg: COLORS.semantic.successBg,
          text: COLORS.semantic.successText,
          border: COLORS.semantic.successBorder,
          label: 'Ongoing',
          icon: 'play-circle' as const,
        };
      case 'Completed':
        return {
          bg: isDark ? colors.neutral[800] : colors.neutral[100],
          text: colors.textMuted,
          border: colors.border,
          label: 'Past',
          icon: 'check-circle' as const,
        };
      case 'Upcoming':
      default:
        return {
          bg: isDark ? colors.neutral[800] : colors.brand.light,
          text: isDark ? colors.brand[500] : colors.brand.primary,
          border: isDark ? colors.brand[500] : colors.brand[200],
          label: 'Upcoming',
          icon: 'clock' as const,
        };
    }
  };

  const timeBadge = getTimeStatusBadge();

  const handleAction = (action: 'view' | 'edit' | 'togglePublish' | 'delete') => {
    setShowMenu(false);
    if (action === 'view') {
      onViewDetails(schedule);
    } else if (action === 'edit') {
      onEdit(schedule);
    } else if (action === 'togglePublish') {
      onTogglePublish(schedule);
    } else if (action === 'delete') {
      onDelete(schedule);
    }
  };

  const solidMenuBg = isDark ? colors.neutral[900] : COLORS.neutral.white;
  const solidMenuBorder = isDark ? colors.neutral[700] : colors.border;

  return (
    <AnimatedCard
      delay={index * 25}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          overflow: 'visible',
          zIndex: showMenu ? 9999 : 1,
        },
      ]}
    >
      {/* Click-away backdrop overlay */}
      {showMenu && (
        <Pressable
          style={styles.popoverBackdrop}
          onPress={() => setShowMenu(false)}
        />
      )}

      {/* Top Header: Service Icon, Service Name, Time Badge, and 3-Dots Menu */}
      <View style={[styles.cardHeader, { zIndex: showMenu ? 99999 : 2 }]}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.serviceIconBox,
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
          <View style={styles.serviceMeta}>
            <View style={styles.serviceCodeRow}>
              <Text
                style={[
                  styles.serviceCodeText,
                  { color: isDark ? colors.brand[500] : colors.brand.primary },
                ]}
              >
                {schedule.serviceCode || 'EXAM-SCHED'}
              </Text>
              <Text style={[styles.codeDivider, { color: colors.textMuted }]}>•</Text>
              <View
                style={[
                  styles.timeBadge,
                  { backgroundColor: timeBadge.bg, borderColor: timeBadge.border },
                ]}
              >
                <Lucide name={timeBadge.icon} size={11} color={timeBadge.text} />
                <Text style={[styles.timeBadgeText, { color: timeBadge.text }]}>
                  {timeBadge.label}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.serviceNameText, { color: colors.text }]}
              numberOfLines={1}
            >
              {schedule.serviceName || 'General Examination Session'}
            </Text>
          </View>
        </View>

        {/* 3-Dots Kebab Action Menu */}
        <View style={[styles.menuWrapper, { zIndex: showMenu ? 99999 : 10 }]}>
          <Pressable
            style={[
              styles.threeDotsBtn,
              {
                backgroundColor: showMenu
                  ? isDark
                    ? colors.neutral[700]
                    : colors.neutral[200]
                  : isDark
                  ? colors.neutral[800]
                  : colors.neutral[100],
                borderColor: colors.border,
              },
              Platform.select({ web: { cursor: 'pointer' } }),
            ]}
            onPress={() => setShowMenu((prev) => !prev)}
            accessibilityLabel="Schedule Actions"
          >
            <Lucide name="more-vertical" size={16} color={colors.text} />
          </Pressable>

          {/* Action Popover Dropdown Menu (100% Solid Opaque Surface Floating Above All Text) */}
          {showMenu && (
            <View
              style={[
                styles.popoverMenu,
                {
                  backgroundColor: solidMenuBg,
                  borderColor: solidMenuBorder,
                },
                SHADOWS.modal,
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.popoverItem,
                  pressed && {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => handleAction('view')}
              >
                <Lucide
                  name="eye"
                  size={14}
                  color={isDark ? colors.brand[500] : colors.brand.primary}
                  style={styles.popoverIcon}
                />
                <Text style={[styles.popoverItemText, { color: colors.text }]}>
                  View Details
                </Text>
              </Pressable>

              {!schedule.isPublished && (
                <Pressable
                  style={({ pressed }) => [
                    styles.popoverItem,
                    pressed && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => handleAction('edit')}
                >
                  <Lucide
                    name="edit-2"
                    size={14}
                    color={isDark ? colors.brand[500] : colors.brand.primary}
                    style={styles.popoverIcon}
                  />
                  <Text style={[styles.popoverItemText, { color: colors.text }]}>
                    Edit Schedule
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.popoverItem,
                  pressed && {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => handleAction('togglePublish')}
              >
                <Lucide
                  name={schedule.isPublished ? 'eye-off' : 'globe'}
                  size={14}
                  color={schedule.isPublished ? COLORS.semantic.warning : COLORS.semantic.success}
                  style={styles.popoverIcon}
                />
                <Text
                  style={[
                    styles.popoverItemText,
                    {
                      color: schedule.isPublished
                        ? COLORS.semantic.warning
                        : COLORS.semantic.success,
                    },
                  ]}
                >
                  {schedule.isPublished ? 'Unpublish (Draft)' : 'Publish to Portal'}
                </Text>
              </Pressable>

              {!schedule.isPublished && (
                <>
                  <View
                    style={[
                      styles.popoverDivider,
                      { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                    ]}
                  />

                  <Pressable
                    style={({ pressed }) => [
                      styles.popoverItem,
                      pressed && {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : COLORS.semantic.errorBg,
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => handleAction('delete')}
                  >
                    <Lucide
                      name="trash-2"
                      size={14}
                      color={COLORS.semantic.error}
                      style={styles.popoverIcon}
                    />
                    <Text style={[styles.popoverItemText, { color: COLORS.semantic.error, fontWeight: TYPOGRAPHY.weights.semibold }]}>
                      Delete Schedule
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Body: Venue Location & Date Periods */}
      <View style={styles.cardBody}>
        {/* Venue */}
        <View style={styles.metaRow}>
          <Lucide name="map-pin" size={14} color={colors.textMuted} style={styles.metaIcon} />
          <Text style={[styles.metaText, { color: colors.text }]} numberOfLines={2}>
            {schedule.venue}
          </Text>
        </View>

        {/* Date Window */}
        <View style={styles.metaRow}>
          <Lucide name="calendar" size={14} color={colors.textMuted} style={styles.metaIcon} />
          <Text style={[styles.metaText, { color: colors.text }]}>
            <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>Schedule:</Text>{' '}
            {formatDate(schedule.startDate)}
            {schedule.endDate && schedule.endDate !== schedule.startDate
              ? ` – ${formatDate(schedule.endDate)}`
              : ''}
          </Text>
        </View>

        {/* Application Filing Deadline */}
        {schedule.endApplication && (
          <View style={styles.metaRow}>
            <Lucide name="file-text" size={14} color={colors.textMuted} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              Filing Deadline: {formatDate(schedule.endApplication)}
            </Text>
          </View>
        )}

        {/* Capacity & Slots */}
        <View style={styles.slotsRow}>
          <View
            style={[
              styles.slotsBadge,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                borderColor: colors.border,
              },
            ]}
          >
            <Lucide name="users" size={13} color={colors.textMuted} />
            <Text style={[styles.slotsText, { color: colors.text }]}>
              Capacity:{' '}
              <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                {typeof schedule.maximumSlots === 'number'
                  ? `${schedule.maximumSlots} slots`
                  : 'Unlimited'}
              </Text>
            </Text>
          </View>

          {schedule.remarks && (
            <View style={styles.remarksTag}>
              <Lucide name="info" size={12} color={colors.textMuted} />
              <Text
                style={[styles.remarksText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {schedule.remarks}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer: Live Status Badge */}
      <View
        style={[
          styles.cardFooter,
          { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] },
        ]}
      >
        <View
          style={[
            styles.publishPill,
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
              styles.publishPillText,
              {
                color: schedule.isPublished
                  ? COLORS.semantic.successText
                  : colors.textMuted,
              },
            ]}
          >
            {schedule.isPublished ? 'Published to Portal' : 'Internal Draft'}
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
    ...SHADOWS.card,
    position: 'relative',
    overflow: 'visible',
  },
  popoverBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9000,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING[10],
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  serviceIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceMeta: {
    flex: 1,
    gap: 2,
  },
  serviceCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceCodeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  codeDivider: {
    fontSize: 10,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  serviceNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  menuWrapper: {
    position: 'relative',
  },
  threeDotsBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 190,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 999999,
    opacity: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.28), 0 8px 10px -6px rgba(15, 23, 42, 0.15)',
      },
    }),
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
  },
  popoverIcon: {
    marginRight: 8,
  },
  popoverItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  popoverDivider: {
    height: 1,
    marginVertical: 4,
  },
  cardBody: {
    gap: SPACING[8],
    position: 'relative',
    zIndex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[8],
  },
  metaIcon: {
    marginTop: 2,
  },
  metaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    flex: 1,
    lineHeight: 18,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
    marginTop: 2,
  },
  slotsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  slotsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  remarksTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  remarksText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING[10],
    borderTopWidth: 1,
    position: 'relative',
    zIndex: 1,
  },
  publishPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  publishPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
