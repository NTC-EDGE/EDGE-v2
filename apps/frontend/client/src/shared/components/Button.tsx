import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
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
  hoverStyle?: ViewStyle;
  textStyle?: TextStyle;
  hoverTextStyle?: TextStyle;
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
  hoverStyle,
  textStyle,
  hoverTextStyle,
  icon,
}: ButtonProps) {
  const getButtonStyles = (hovered: boolean, pressed: boolean): ViewStyle[] => {
    const list: ViewStyle[] = [styles.base];

    // Variant styles
    if (variant === 'primary') {
      list.push(styles.primary);
    } else if (variant === 'secondary') {
      list.push(styles.secondary);
    } else if (variant === 'outline') {
      list.push(styles.outline);
    } else if (variant === 'text') {
      list.push(styles.textVariant);
    }

    // Size styles
    if (size === 'sm') {
      list.push(styles.sm);
    } else if (size === 'md') {
      list.push(styles.md);
    } else if (size === 'lg') {
      list.push(styles.lg);
    }

    if (style !== undefined) {
      list.push(style);
    }

    // Hover styles applied after static styles so hover color takes effect smoothly
    if (hovered && !disabled) {
      if (variant === 'primary') {
        list.push(styles.primaryHovered);
      } else if (variant === 'secondary') {
        list.push(styles.secondaryHovered);
      } else if (variant === 'outline') {
        list.push(styles.outlineHovered);
      } else if (variant === 'text') {
        list.push(styles.textVariantHovered);
      }
      if (hoverStyle !== undefined) {
        list.push(hoverStyle);
      }
    }

    if (disabled) {
      list.push(styles.disabled);
    }

    if (pressed && !disabled) {
      list.push(styles.pressed);
    }

    return list;
  };

  const getTextStyles = (hovered: boolean): TextStyle[] => {
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

    if (textStyle !== undefined) {
      list.push(textStyle);
    }

    if (hovered && !disabled) {
      if (variant === 'outline') {
        list.push(styles.textOutlineHovered);
      } else if (variant === 'text') {
        list.push(styles.textLinkHovered);
      }
      if (hoverTextStyle !== undefined) {
        list.push(hoverTextStyle);
      }
    }

    if (disabled) {
      list.push(styles.textDisabled);
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
      {({ hovered = false }: PressableState) =>
        loading ? (
          <ActivityIndicator size="small" color={getIndicatorColor()} />
        ) : (
          <View style={styles.contentContainer}>
            {icon !== undefined && icon !== null ? (
              <View style={styles.iconContainer}>{icon}</View>
            ) : null}
            <Text style={getTextStyles(hovered)}>{title}</Text>
          </View>
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    ...(Platform.OS === 'web'
      ? {
          transitionProperty: 'all',
          transitionDuration: '200ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }
      : {}),
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
    backgroundColor: COLORS.brand[700], // Noticeable dark blue hover state
    transform: [{ translateY: -2 }],
    shadowColor: COLORS.brand[800],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  secondary: {
    backgroundColor: COLORS.neutral[800],
  },
  secondaryHovered: {
    backgroundColor: '#090D16',
    transform: [{ translateY: -2 }],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.brand[800],
  },
  outlineHovered: {
    backgroundColor: '#EEF2FF', // Noticeable light blue fill on hover
    borderColor: COLORS.brand[700],
    transform: [{ translateY: -2 }],
    shadowColor: COLORS.brand[800],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    ...(Platform.OS === 'web'
      ? {
          transitionProperty: 'color',
          transitionDuration: '200ms',
        }
      : {}),
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
  textOutlineHovered: {
    color: COLORS.brand[700],
  },
  textLink: {
    color: COLORS.brand[800],
    textDecorationLine: 'underline',
  },
  textLinkHovered: {
    color: COLORS.brand[700],
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
