import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { TYPOGRAPHY } from '../theme/tokens';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onBackPress?: () => void;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  onBackPress,
  action,
  style,
}: PageHeaderProps) {
  const { colors, isDark } = useTheme();

  const hasBack = onBackPress !== undefined;
  const hasSubtitle = subtitle !== undefined && subtitle.length > 0;
  const hasBadge = badge !== undefined && badge !== null;
  const hasAction = action !== undefined && action !== null;

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }, style]}>
      <View style={styles.leftContainer}>
        {hasBack ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={[
              styles.backButton,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleColumn}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {hasBadge ? <View style={styles.badgeWrapper}>{badge}</View> : null}
          </View>

          {hasSubtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {hasAction ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 240,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.3,
  },
  badgeWrapper: {
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
});
