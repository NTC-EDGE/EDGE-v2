import React, { ComponentProps, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme/tokens';

// Suppress browser-native password reveal icons (e.g. Edge ::-ms-reveal) on Web to avoid double eye icons
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'edge-hide-native-password-reveal';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      input::-ms-reveal,
      input::-ms-clear {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      input::-webkit-contacts-auto-fill-button,
      input::-webkit-credentials-auto-fill-button {
        visibility: hidden !important;
        display: none !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

type LucideIconName = ComponentProps<typeof Lucide>['name'];

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText?: (text: string) => void;
  error?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  iconName?: LucideIconName;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText = () => {},
  error,
  editable = true,
  secureTextEntry = false,
  isPassword = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
  inputStyle,
  iconName,
  rightIcon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecured = isPassword ? !showPassword : secureTextEntry;

  const getRowStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.inputRow];
    if (isFocused) {
      list.push(styles.rowFocused);
    }
    if (error !== undefined && error.length > 0) {
      list.push(styles.rowError);
    }
    return list;
  };

  const handleTextChange = (text: string) => {
    let sanitized = text;
    if (keyboardType === 'numeric') {
      sanitized = text.replace(/[^0-9.]/g, '');
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }
    } else if (keyboardType === 'phone-pad') {
      sanitized = text.replace(/[^0-9+]/g, '');
      if (sanitized.includes('+')) {
        sanitized = (sanitized.startsWith('+') ? '+' : '') + sanitized.replace(/\+/g, '');
      }
    }
    onChangeText(sanitized);
  };

  const renderRightContent = () => {
    if (rightIcon !== undefined && rightIcon !== null) {
      return <View style={styles.rightIconContainer}>{rightIcon}</View>;
    }
    if (isPassword) {
      return (
        <View style={styles.rightIconContainer}>
          <Lucide
            name={showPassword ? 'eye-off' : 'eye'}
            size={18}
            color={COLORS.neutral[500]}
            onPress={() => setShowPassword((prev) => !prev)}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label !== undefined && label.length > 0 ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View style={getRowStyles()}>
        {iconName !== undefined && iconName !== null ? (
          <Lucide
            name={iconName}
            size={18}
            color={isFocused ? COLORS.brand[800] : COLORS.neutral[400]}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral[400]}
          value={value}
          onChangeText={handleTextChange}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecured}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={[
            styles.input,
            inputStyle,
            !editable && { color: COLORS.neutral[500], backgroundColor: COLORS.neutral[100] },
          ]}
        />
        {renderRightContent()}
      </View>
      {error !== undefined && error.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING[16],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.smallLabel,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING[8],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[16],
    overflow: 'hidden',
  },
  rowFocused: {
    borderColor: COLORS.brand[800],
    borderWidth: 1.5,
    backgroundColor: COLORS.neutral.white,
  },
  rowError: {
    borderColor: COLORS.semantic.error,
  },
  icon: {
    marginRight: SPACING[12],
  },
  rightIconContainer: {
    marginLeft: SPACING[8],
    justifyContent: 'center',
    alignItems: 'center',
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  },
  input: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
    padding: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineWidth: 0,
          outlineColor: 'transparent',
          outlineStyle: 'none',
        } as unknown as TextStyle)
      : {}),
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.semantic.error,
    marginTop: SPACING[4],
  },
});
