import React, { ComponentProps } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

type LucideIconName = ComponentProps<typeof Lucide>['name'];

interface MetricCardProps {
  title: string;
  value: string | number;
  iconName: LucideIconName;
  iconColor: string;
  iconBgColor: string;
}

export function MetricCard({ title, value, iconName, iconColor, iconBgColor }: MetricCardProps) {
  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Left side: Icon Badge */}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Lucide name={iconName} size={24} color={iconColor} />
      </View>

      {/* Right side: Text Metrics */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.valueText}>{value}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
    gap: SPACING[20],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  titleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
  },
  valueText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
});
