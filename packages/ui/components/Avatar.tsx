import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../theme/tokens';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarVariant = 'circle' | 'square';

interface AvatarProps {
  imageUri?: string | null;
  name: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  useDeterministicColors?: boolean;
}

const fallbackColors = [
  { bg: COLORS.brand[900], text: COLORS.neutral.white },
  { bg: COLORS.brand[700], text: COLORS.neutral.white },
  { bg: COLORS.brand[500], text: COLORS.neutral.white },
  { bg: COLORS.semantic.successBg, text: COLORS.semantic.success },
  { bg: COLORS.semantic.warningBg, text: COLORS.semantic.warning },
  { bg: COLORS.semantic.infoBg, text: COLORS.semantic.info },
] as const;

export function getAvatarColors(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbackColors.length;
  const match = fallbackColors[index];
  if (match !== undefined) {
    return match;
  }
  return { bg: COLORS.neutral[100], text: COLORS.neutral[900] };
}

export function Avatar({
  imageUri,
  name,
  size = 'md',
  variant = 'circle',
  useDeterministicColors = false,
}: AvatarProps) {
  const initial = name.length > 0 ? name.charAt(0).toUpperCase() : 'S';

  const colors = useDeterministicColors
    ? getAvatarColors(name)
    : { bg: COLORS.neutral.white, text: COLORS.brand[900] };

  const sizeValue = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
  const borderRadius = variant === 'circle' ? sizeValue / 2 : RADIUS.button;

  const containerStyle = [
    styles.avatarContainer,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius,
      backgroundColor: colors.bg,
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
      <Text style={[styles.fallbackText, fontStyle, { color: colors.text }]}>
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
