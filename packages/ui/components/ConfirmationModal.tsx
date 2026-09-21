import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Feather as Lucide } from '@expo/vector-icons';

export type ConfirmationVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  subtitle?: string | React.ReactNode;
  variant?: ConfirmationVariant;
  icon?: keyof typeof Lucide.glyphMap;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  maxWidth?: number;
}

export function ConfirmationModal({
  visible,
  title,
  subtitle,
  variant = 'success',
  icon,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  children,
  onConfirm,
  onCancel,
  maxWidth = 460,
}: ConfirmationModalProps) {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const defaultIcon: keyof typeof Lucide.glyphMap =
    icon ??
    (variant === 'success'
      ? 'check-circle'
      : variant === 'danger'
      ? 'alert-triangle'
      : variant === 'warning'
      ? 'alert-circle'
      : variant === 'purple'
      ? 'send'
      : 'info');

  const accentColor =
    variant === 'success'
      ? (isDark ? '#22C55E' : '#16A34A')
      : variant === 'danger'
      ? (isDark ? '#EF4444' : '#DC2626')
      : variant === 'warning'
      ? (isDark ? '#F59E0B' : '#D97706')
      : variant === 'purple'
      ? (isDark ? '#A855F7' : '#9333EA')
      : (isDark ? '#3B82F6' : '#2563EB');

  const iconBg =
    variant === 'success'
      ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
      : variant === 'danger'
      ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2')
      : variant === 'warning'
      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7')
      : variant === 'purple'
      ? (isDark ? 'rgba(168, 85, 247, 0.2)' : '#F3E8FF')
      : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
              maxWidth,
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
            <Lucide name={defaultIcon} size={30} color={accentColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: isDark ? colors.neutral[100] : COLORS.neutral[900] }]}>
            {title}
          </Text>

          {/* Subtitle */}
          {typeof subtitle === 'string' ? (
            <Text style={[styles.subtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
              {subtitle}
            </Text>
          ) : (
            subtitle ?? null
          )}

          {/* Optional Children (Form fields, remarks, custom inputs) */}
          {children !== undefined && children !== null && (
            <View style={styles.childrenWrapper}>{children}</View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              disabled={isLoading}
              style={[
                styles.cancelBtn,
                { borderColor: isDark ? colors.neutral[700] : COLORS.neutral[300] },
                isLoading && { opacity: 0.5 },
                Platform.select({ web: { cursor: isLoading ? 'not-allowed' : 'pointer' } as object }),
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              disabled={isLoading}
              style={[
                styles.confirmBtn,
                { backgroundColor: accentColor },
                isLoading && { opacity: 0.7 },
                Platform.select({ web: { cursor: isLoading ? 'not-allowed' : 'pointer' } as object }),
              ]}
              onPress={onConfirm}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Lucide name="check" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[24],
  },
  container: {
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    width: '100%',
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  iconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[8],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[20],
  },
  childrenWrapper: {
    width: '100%',
    marginBottom: SPACING[20],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[12],
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  confirmBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
