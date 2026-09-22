import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { employeesScreenStyles as styles } from '../styles/employeesScreenStyles';

interface EmployeesToastProps {
  toastState: {
    message: string;
    variant: 'success' | 'error' | 'info';
  } | null;
  onClose: () => void;
}

export function EmployeesToast({ toastState, onClose }: EmployeesToastProps) {
  if (toastState === null) {
    return null;
  }

  const isError = toastState.variant === 'error';
  const isInfo = toastState.variant === 'info';

  const iconName = isError ? 'alert-circle' : isInfo ? 'info' : 'check-circle';
  const iconColor = isError
    ? COLORS.semantic.error
    : isInfo
    ? COLORS.brand[500]
    : COLORS.semantic.success;

  return (
    <View
      style={[
        styles.toastContainer,
        isError && { borderLeftColor: COLORS.semantic.error, backgroundColor: '#FEF2F2' },
        isInfo && { borderLeftColor: COLORS.brand[500] },
        SHADOWS.modal,
      ]}
    >
      <Lucide name={iconName} size={18} color={iconColor} style={{ marginRight: 8 }} />
      <Text style={[styles.toastText, isError && { color: COLORS.semantic.error }]}>
        {toastState.message}
      </Text>
      <Pressable onPress={onClose} style={{ marginLeft: 12, padding: 4 }}>
        <Lucide name="x" size={14} color={COLORS.neutral[500]} />
      </Pressable>
    </View>
  );
}
