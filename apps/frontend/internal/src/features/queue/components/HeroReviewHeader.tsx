import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, TYPOGRAPHY, RADIUS, SPACING, useTheme } from '@edge/ui';

export interface AppliedServiceDetail {
  id?: string;
  name: string;
  category?: string;
  variant?: string;
}

export interface HeroReviewHeaderProps {
  serviceName?: string;
  isExamService?: boolean;
  variantLabel?: string;
  scheduleSummaryText?: string | null;
  mode?: string;
  services?: AppliedServiceDetail[];
  totalApplicants?: number;
  isDesktop?: boolean;
}

export function HeroReviewHeader({
  serviceName,
  isExamService = false,
  variantLabel,
  scheduleSummaryText,
  mode = 'Single Application',
  services,
  totalApplicants,
  isDesktop = true,
}: HeroReviewHeaderProps) {
  const { colors, isDark } = useTheme();

  // Consolidate services list
  const activeServices: AppliedServiceDetail[] = React.useMemo(() => {
    if (services && services.length > 0) {
      return services;
    }
    if (serviceName && serviceName.trim().length > 0) {
      return [
        {
          name: serviceName,
          variant: variantLabel && variantLabel !== 'Standard' ? variantLabel : undefined,
          category: isExamService ? 'Exams' : 'Permits',
        },
      ];
    }
    return [
      {
        name: 'Permit / Service Application',
        variant: variantLabel && variantLabel !== 'Standard' ? variantLabel : undefined,
      },
    ];
  }, [services, serviceName, variantLabel, isExamService]);

  const isBulk = mode.toLowerCase().includes('bulk') || (totalApplicants !== undefined && totalApplicants > 1);
  const displayModeText = isBulk
    ? (totalApplicants !== undefined && totalApplicants > 0
        ? `Bulk Application (${totalApplicants} Applicants)`
        : 'Bulk Application')
    : 'Single Application';

  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const cardBorder = isDark ? colors.neutral[700] : '#E2E8F0';
  const textPrimary = isDark ? colors.neutral[100] : '#0F172A';
  const textSecondary = isDark ? colors.neutral[400] : '#64748B';

  const bulkBadgeBg = isDark ? 'rgba(180, 83, 9, 0.2)' : '#FEF3C7';
  const bulkBadgeBorder = isDark ? '#B45309' : '#FDE68A';
  const bulkBadgeColor = isDark ? '#FBBF24' : '#D97706';

  const singleBadgeBg = isDark ? 'rgba(29, 78, 216, 0.15)' : '#EFF6FF';
  const singleBadgeBorder = isDark ? '#1D4ED8' : '#DBEAFE';
  const singleBadgeColor = isDark ? '#60A5FA' : '#1D4ED8';

  const itemBg = isDark ? colors.neutral[900] : '#F8FAFC';
  const itemBorder = isDark ? colors.neutral[700] : '#E2E8F0';

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      {/* ── Top Meta Bar: Mode + Processing Office ── */}
      <View style={styles.topMetaBar}>
        <View style={styles.leftTags}>
          {/* Mode Badge */}
          <View
            style={[
              styles.modePill,
              {
                backgroundColor: isBulk ? bulkBadgeBg : singleBadgeBg,
                borderColor: isBulk ? bulkBadgeBorder : singleBadgeBorder,
              },
            ]}
          >
            <Icon
              name={isBulk ? 'users' : 'user'}
              size={12}
              color={isBulk ? bulkBadgeColor : singleBadgeColor}
            />
            <Text
              style={[
                styles.modePillText,
                { color: isBulk ? bulkBadgeColor : singleBadgeColor },
              ]}
            >
              {displayModeText}
            </Text>
          </View>

          {/* Multiple Services Count Badge */}
          {activeServices.length > 1 && (
            <View
              style={[
                styles.countPill,
                {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',
                  borderColor: isDark ? '#6366F1' : '#C7D2FE',
                },
              ]}
            >
              <Icon name="layers" size={11} color={isDark ? '#A5B4FC' : '#4F46E5'} />
              <Text
                style={[
                  styles.countPillText,
                  { color: isDark ? '#A5B4FC' : '#4F46E5' },
                ]}
              >
                {activeServices.length} Services
              </Text>
            </View>
          )}
        </View>

        {/* Processing Office / Schedule Info */}
        {scheduleSummaryText && (
          <View style={[styles.officePill, { backgroundColor: itemBg, borderColor: itemBorder }]}>
            <Icon
              name={isExamService ? 'calendar' : 'map-pin'}
              size={12}
              color={isDark ? colors.brand[400] : '#2563EB'}
            />
            <Text style={[styles.officeLabel, { color: textSecondary }]}>
              {isExamService ? 'Exam Venue:' : 'Office:'}
            </Text>
            <Text style={[styles.officeValue, { color: textPrimary }]} numberOfLines={1}>
              {scheduleSummaryText}
            </Text>
          </View>
        )}
      </View>

      {/* ── Services Display ── */}
      {activeServices.length === 1 ? (
        // Single Service Display
        <View style={styles.singleServiceBlock}>
          <View
            style={[
              styles.serviceIconWrap,
              {
                backgroundColor: isDark ? colors.neutral[700] : '#EFF6FF',
                borderColor: isDark ? colors.brand[500] : '#BFDBFE',
              },
            ]}
          >
            <Icon
              name={isExamService ? 'book-open' : 'award'}
              size={22}
              color={isDark ? colors.brand[400] : '#1D4ED8'}
            />
          </View>
          <View style={styles.singleServiceInfo}>
            <Text style={[styles.serviceSectionTitle, { color: textSecondary }]}>
              APPLICATION FOR SERVICE
            </Text>
            <Text style={[styles.serviceTitle, { color: textPrimary }]}>
              {activeServices[0]?.name}
            </Text>
            <View style={styles.badgesRow}>
              {activeServices[0]?.category && (
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: isDark ? colors.neutral[700] : '#F1F5F9',
                      borderColor: isDark ? colors.neutral[600] : '#CBD5E1',
                    },
                  ]}
                >
                  <Icon name="grid" size={10} color={textSecondary} />
                  <Text style={[styles.tagBadgeText, { color: textSecondary }]}>
                    {activeServices[0]?.category}
                  </Text>
                </View>
              )}
              {activeServices[0]?.variant && (
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF',
                      borderColor: isDark ? '#0284C7' : '#BAE6FD',
                    },
                  ]}
                >
                  <Icon name="layers" size={10} color={isDark ? '#38BDF8' : '#0284C7'} />
                  <Text
                    style={[
                      styles.tagBadgeText,
                      { color: isDark ? '#38BDF8' : '#0284C7', fontWeight: '600' },
                    ]}
                  >
                    Variant: {activeServices[0]?.variant}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        // Multiple Services Display
        <View style={styles.multiServiceBlock}>
          <Text style={[styles.serviceSectionTitle, { color: textSecondary, marginBottom: 8 }]}>
            APPLIED SERVICES ({activeServices.length})
          </Text>
          <View style={styles.servicesGrid}>
            {activeServices.map((svc, idx) => (
              <View
                key={svc.id ?? `svc-${idx}`}
                style={[
                  styles.serviceCard,
                  { backgroundColor: itemBg, borderColor: itemBorder },
                ]}
              >
                <View style={styles.serviceCardHeader}>
                  <View
                    style={[
                      styles.serviceMiniIcon,
                      { backgroundColor: isDark ? colors.neutral[700] : '#EFF6FF' },
                    ]}
                  >
                    <Icon name="award" size={14} color={isDark ? colors.brand[400] : '#1D4ED8'} />
                  </View>
                  <Text style={[styles.serviceCardTitle, { color: textPrimary }]} numberOfLines={1}>
                    {svc.name}
                  </Text>
                </View>
                <View style={styles.badgesRow}>
                  {svc.category && (
                    <View
                      style={[
                        styles.tagBadge,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF',
                          borderColor: isDark ? colors.neutral[700] : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text style={[styles.tagBadgeText, { color: textSecondary }]}>
                        {svc.category}
                      </Text>
                    </View>
                  )}
                  {svc.variant && (
                    <View
                      style={[
                        styles.tagBadge,
                        {
                          backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : '#F0F9FF',
                          borderColor: isDark ? '#0284C7' : '#BAE6FD',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagBadgeText,
                          { color: isDark ? '#38BDF8' : '#0284C7', fontWeight: '600' },
                        ]}
                      >
                        {svc.variant}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    borderWidth: 1,
    marginBottom: SPACING[16],
    gap: SPACING[12],
  },
  topMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  leftTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  modePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  countPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  officePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  officeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  officeValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    maxWidth: 220,
  },
  singleServiceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  singleServiceInfo: {
    flex: 1,
    gap: 3,
  },
  serviceSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  serviceTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
  },
  multiServiceBlock: {
    gap: 6,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceCard: {
    flex: 1,
    minWidth: 240,
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 6,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceMiniIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
