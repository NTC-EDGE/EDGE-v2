import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TYPOGRAPHY, LIGHT_COLORS } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ThemeColors } from '../theme/types';

export const getStatusColors = (status: string, themeColors?: ThemeColors) => {
  const normalized = status.toLowerCase();
  const c = themeColors ?? LIGHT_COLORS;

  if (normalized === 'approved' || normalized === 'active' || normalized === 'complete') {
    return {
      bg: c.semantic.successBg,
      border: c.semantic.successBorder,
      text: c.semantic.successText,
    };
  }
  if (normalized === 'pending' || normalized === 'reviewing' || normalized === 'warning') {
    return {
      bg: c.semantic.warningBg,
      border: c.semantic.warningBorder,
      text: c.semantic.warningText,
    };
  }
  if (normalized === 'rejected' || normalized === 'failed' || normalized === 'error') {
    return {
      bg: c.semantic.errorBg,
      border: c.semantic.errorBorder,
      text: c.semantic.errorText,
    };
  }
  return {
    bg: c.neutral[100],
    border: c.border,
    text: c.textMuted,
  };
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const badgeColors = getStatusColors(status, colors);
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg, borderColor: badgeColors.border }]}>
      <Text style={[styles.badgeText, { color: badgeColors.text }]}>{status}</Text>
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
