import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { RADIUS, TYPOGRAPHY, LIGHT_COLORS } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ThemeColors } from '../theme/types';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarVariant = 'circle' | 'square';

export interface AvatarProps {
  imageUri?: string | null;
  name: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  useDeterministicColors?: boolean;
}

export function getAvatarColors(name: string, themeColors?: ThemeColors) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  if (themeColors !== undefined) {
    const dynamicFallbackColors = [
      { bg: themeColors.brand[900], text: themeColors.neutral.white },
      { bg: themeColors.brand[700], text: themeColors.neutral.white },
      { bg: themeColors.brand[500], text: themeColors.neutral.white },
      { bg: themeColors.semantic.successBg, text: themeColors.semantic.success },
      { bg: themeColors.semantic.warningBg, text: themeColors.semantic.warning },
      { bg: themeColors.semantic.infoBg, text: themeColors.semantic.info },
    ];
    const index = Math.abs(hash) % dynamicFallbackColors.length;
    const match = dynamicFallbackColors[index];
    if (match !== undefined) {
      return match;
    }
    return { bg: themeColors.neutral[100], text: themeColors.text };
  }

  return { bg: LIGHT_COLORS.brand[800], text: LIGHT_COLORS.neutral.white };
}

export function Avatar({
  imageUri,
  name,
  size = 'md',
  variant = 'circle',
  useDeterministicColors = false,
}: AvatarProps) {
  const { colors } = useTheme();
  const initial = name.length > 0 ? name.charAt(0).toUpperCase() : 'S';

  const avatarColor = useDeterministicColors
    ? getAvatarColors(name, colors)
    : { bg: colors.cardBg, text: colors.brand[800] };

  const sizeValue = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
  const borderRadius = variant === 'circle' ? sizeValue / 2 : RADIUS.button;

  const containerStyle = [
    styles.avatarContainer,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius,
      backgroundColor: avatarColor.bg,
    },
  ];

  if (imageUri !== undefined && imageUri !== null && imageUri.length > 0) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{
          width: sizeValue,
          height: sizeValue,
          borderRadius,
        }}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.fallbackText, fontStyle, { color: avatarColor.text }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },
});
