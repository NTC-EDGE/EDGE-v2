import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

interface PressableState {
  pressed: boolean;
  hovered?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const getButtonStyles = (hovered: boolean, pressed: boolean): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    // Variant styles
    if (variant === 'primary') {
      list.push(styles.primary);
      if (hovered && !disabled) {
        list.push(styles.primaryHovered);
      }
    } else if (variant === 'secondary') {
      list.push(styles.secondary);
      if (hovered && !disabled) {
        list.push(styles.secondaryHovered);
      }
    } else if (variant === 'outline') {
      list.push(styles.outline);
      if (hovered && !disabled) {
        list.push(styles.outlineHovered);
      }
    } else if (variant === 'text') {
      list.push(styles.textVariant);
      if (hovered && !disabled) {
        list.push(styles.textVariantHovered);
      }
    }

    // Size styles
    if (size === 'sm') {
      list.push(styles.sm);
    } else if (size === 'md') {
      list.push(styles.md);
    } else if (size === 'lg') {
      list.push(styles.lg);
    }

    if (disabled) {
      list.push(styles.disabled);
    }

    if (pressed && !disabled) {
      list.push(styles.pressed);
    }

    if (style !== undefined) {
      list.push(style);
    }

    return list;
  };

  const getTextStyles = (): TextStyle[] => {
    const list: TextStyle[] = [styles.textBase];

    // Variant text styles
    if (variant === 'primary') {
      list.push(styles.textPrimary);
    } else if (variant === 'secondary') {
      list.push(styles.textSecondary);
    } else if (variant === 'outline') {
      list.push(styles.textOutline);
    } else if (variant === 'text') {
      list.push(styles.textLink);
    }

    // Size text styles
    if (size === 'sm') {
      list.push(styles.textSm);
    } else if (size === 'md') {
      list.push(styles.textMd);
    } else if (size === 'lg') {
      list.push(styles.textLg);
    }

    if (disabled) {
      list.push(styles.textDisabled);
    }

    if (textStyle !== undefined) {
      list.push(textStyle);
    }

    return list;
  };

  const getIndicatorColor = (): string => {
    if (variant === 'primary') {
      return COLORS.neutral.white;
    }
    if (variant === 'secondary') {
      return COLORS.neutral.white;
    }
    return COLORS.brand[800];
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ hovered = false, pressed }: PressableState) =>
        getButtonStyles(hovered, pressed)
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIndicatorColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon !== undefined && icon !== null ? (
            <View style={styles.iconContainer}>{icon}</View>
          ) : null}
          <Text style={getTextStyles()}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.button,
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: COLORS.brand[800],
  },
  primaryHovered: {
    backgroundColor: '#0F2B88',
    transform: [{ translateY: -2 }],
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  secondary: {
    backgroundColor: COLORS.neutral[800],
  },
  secondaryHovered: {
    backgroundColor: COLORS.neutral[900],
    transform: [{ translateY: -2 }],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.brand[800],
  },
  outlineHovered: {
    backgroundColor: '#EEF2FF',
    borderColor: '#0F2B88',
    transform: [{ translateY: -2 }],
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textVariant: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  textVariantHovered: {
    opacity: 0.8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 0 }],
  },
  sm: {
    height: 36,
    paddingHorizontal: SPACING[12],
  },
  md: {
    height: 46,
    paddingHorizontal: SPACING[20],
  },
  lg: {
    height: 54,
    paddingHorizontal: SPACING[32],
  },
  disabled: {
    backgroundColor: COLORS.neutral[200],
    borderColor: COLORS.neutral[200],
  },
  textBase: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  textPrimary: {
    color: COLORS.neutral.white,
  },
  textSecondary: {
    color: COLORS.neutral.white,
  },
  textOutline: {
    color: COLORS.brand[800],
  },
  textLink: {
    color: COLORS.brand[800],
    textDecorationLine: 'underline',
  },
  textSm: {
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  textMd: {
    fontSize: TYPOGRAPHY.sizes.smallLabel,
  },
  textLg: {
    fontSize: TYPOGRAPHY.sizes.body,
  },
  textDisabled: {
    color: COLORS.neutral[400],
  },
});
