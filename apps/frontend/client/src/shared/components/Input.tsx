import React, { ComponentProps } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme/tokens';

type LucideIconName = ComponentProps<typeof Lucide>['name'];

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
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
  onChangeText,
  error,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
  inputStyle,
  iconName,
  rightIcon,
}: InputProps) {
  const getRowStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.inputRow];
    if (error !== undefined && error.length > 0) {
      list.push(styles.rowError);
    }
    return list;
  };

  return (
    <View style={[styles.container, style]}>
      {label !== undefined && label.length > 0 ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View style={getRowStyles()}>
        {iconName !== undefined && iconName !== null ? (
          <Lucide name={iconName} size={18} color={COLORS.neutral[400]} style={styles.icon} />
        ) : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={[styles.input, inputStyle]}
        />
        {rightIcon !== undefined && rightIcon !== null ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
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
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
    padding: 0, // Reset default padding
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.semantic.error,
    marginTop: SPACING[4],
  },
});
