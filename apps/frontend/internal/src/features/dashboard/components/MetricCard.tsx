import React, { ComponentProps } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../shared/theme/tokens';

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
  const trendColor = isPositive ? COLORS.semantic.success : COLORS.semantic.error;
  const trendIconName = isPositive ? 'trending-up' : 'trending-down';

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Top row: Title and Icon */}
      <View style={styles.topRow}>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.iconContainer}>
          <Lucide name={iconName as any} size={20} color={COLORS.brand[700]} />
        </View>
      </View>

      {/* Main Metric Value */}
      <Text style={styles.valueText}>{value}</Text>

      {/* Trend indicator and subtitle */}
      <View style={styles.trendRow}>
        <View style={[styles.trendBadge, { backgroundColor: isPositive ? COLORS.semantic.successBg : COLORS.semantic.errorBg }]}>
          <Lucide name={trendIconName} size={12} color={trendColor} style={{ marginRight: 4 }} />
          <Text style={[styles.trendText, { color: trendColor }]}>{change}</Text>
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
    marginBottom: SPACING[12],
  },
  titleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
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
  },
  trendText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
