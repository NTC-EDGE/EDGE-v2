import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { ThemeMode } from '../theme/types';
import { TYPOGRAPHY, COLORS } from '../theme/tokens';

export type ThemeToggleVariant = 'segmented' | 'icon';
export type ThemeToggleSize = 'sm' | 'md';

export interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
  size?: ThemeToggleSize;
  style?: ViewStyle;
  iconColor?: string;
}

export function ThemeToggle({ variant = 'segmented', size = 'md', style, iconColor }: ThemeToggleProps) {
  const { mode, setMode, colors, isDark } = useTheme();

  if (variant === 'icon') {
    const handleCycleMode = () => {
      if (mode === 'light') setMode('dark');
      else if (mode === 'dark') setMode('system');
      else setMode('light');
    };

    const iconName = mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'monitor';

    return (
      <TouchableOpacity
        onPress={handleCycleMode}
        style={[
          styles.iconButton,
          size === 'sm' ? styles.iconButtonSm : styles.iconButtonMd,
          { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
          style,
        ]}
        activeOpacity={0.7}
      >
        <Icon name={iconName} size={size === 'sm' ? 16 : 20} color={iconColor ?? colors.text} />
      </TouchableOpacity>
    );
  }

  const modes: { key: ThemeMode; label: string; icon: keyof typeof Icon.glyphMap }[] = [
    { key: 'light', label: 'Light', icon: 'sun' },
    { key: 'dark', label: 'Dark', icon: 'moon' },
    { key: 'system', label: 'System', icon: 'monitor' },
  ];

  return (
    <View
      style={[
        styles.segmentedContainer,
        { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
        style,
      ]}
    >
      {modes.map((item) => {
        const isActive = mode === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => setMode(item.key)}
            style={[
              styles.segmentItem,
              size === 'sm' ? styles.segmentItemSm : styles.segmentItemMd,
              isActive && [
                styles.segmentItemActive,
                { backgroundColor: isDark ? colors.brand[800] : colors.cardBg },
              ],
            ]}
            activeOpacity={0.8}
          >
            <Icon
              name={item.icon}
              size={size === 'sm' ? 13 : 15}
              color={isActive ? (isDark ? colors.neutral.white : colors.brand[800]) : colors.textMuted}
            />
            {size === 'md' ? (
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? (isDark ? colors.neutral.white : colors.brand[800]) : colors.textMuted },
                  isActive && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 6,
  },
  segmentItemSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  segmentItemMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  segmentItemActive: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  segmentTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  iconButton: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSm: {
    width: 32,
    height: 32,
  },
  iconButtonMd: {
    width: 40,
    height: 40,
  },
});
