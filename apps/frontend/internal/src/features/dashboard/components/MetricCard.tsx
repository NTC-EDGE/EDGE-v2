import React, { ComponentProps } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

type LucideIconName = ComponentProps<typeof Lucide>['name'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  iconName: LucideIconName;
  subtitle: string;
}

export function MetricCard({ title, value, change, isPositive, iconName, subtitle }: MetricCardProps) {
  const trend = isPositive ? COLORS.semantic.success : COLORS.semantic.error;
  const trendBg = isPositive ? COLORS.semantic.successBg : COLORS.semantic.errorBg;
  const trendBorder = isPositive ? COLORS.semantic.successBorder : COLORS.semantic.errorBorder;
  const trendIconName = isPositive ? 'trending-up' : 'trending-down';

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Top row: Title and Icon */}
      <View style={styles.topRow}>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.iconContainer}>
          <Lucide name={iconName} size={18} color={COLORS.brand[800]} />
        </View>
      </View>

      {/* Main Metric Value */}
      <Text style={styles.valueText}>{value}</Text>

      {/* Trend indicator and subtitle */}
      <View style={styles.trendRow}>
        <View style={[styles.trendBadge, { backgroundColor: trendBg, borderColor: trendBorder }]}>
          <Lucide name={trendIconName} size={11} color={trend} style={{ marginRight: 3 }} />
          <Text style={[styles.trendText, { color: trend }]}>{change}</Text>
        </View>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    flex: 1,
    minWidth: 260,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  titleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  valueText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
    letterSpacing: -0.5,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  trendText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
