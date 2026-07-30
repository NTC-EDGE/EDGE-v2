import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { Button } from './Button';
import { TYPOGRAPHY } from '../theme/tokens';

export interface EmptyStateProps {
  icon?: keyof typeof Icon.glyphMap | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

function isIconName(name: string): name is keyof typeof Icon.glyphMap {
  return name in Icon.glyphMap;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  const hasDescription = description !== undefined && description.length > 0;
  const hasAction = actionLabel !== undefined && onActionPress !== undefined;

  const renderIcon = () => {
    if (typeof icon === 'string') {
      const iconName = isIconName(icon) ? icon : 'inbox';
      return (
        <Icon
          name={iconName}
          size={28}
          color={isDark ? colors.brand[500] : colors.brand[800]}
        />
      );
    }
    return icon;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
            borderColor: colors.border,
          },
        ]}
      >
        {renderIcon()}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {hasDescription ? (
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      ) : null}

      {hasAction ? (
        <View style={styles.actionWrapper}>
          <Button onPress={onActionPress} variant="primary" size="sm" fullWidth={false}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  actionWrapper: {
    marginTop: 16,
  },
});
