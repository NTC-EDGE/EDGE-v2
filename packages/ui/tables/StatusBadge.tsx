import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme/tokens';

export const getStatusColors = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'approved' || normalized === 'active' || normalized === 'complete') {
    return {
      bg: COLORS.semantic.successBg,
      border: COLORS.semantic.successBorder,
      text: COLORS.semantic.success,
    };
  }
  if (normalized === 'pending' || normalized === 'reviewing' || normalized === 'warning') {
    return {
      bg: COLORS.semantic.warningBg,
      border: COLORS.semantic.warningBorder,
      text: COLORS.semantic.warning,
    };
  }
  if (normalized === 'rejected' || normalized === 'failed' || normalized === 'error') {
    return {
      bg: COLORS.semantic.errorBg,
      border: COLORS.semantic.errorBorder,
      text: COLORS.semantic.error,
    };
  }
  return {
    bg: COLORS.neutral[100],
    border: COLORS.neutral[200],
    text: COLORS.neutral[600],
  };
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = getStatusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
