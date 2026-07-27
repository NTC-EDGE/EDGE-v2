import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/tokens';

export interface ConfirmationDialogAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
  iconName?: React.ComponentProps<typeof Lucide>['name'];
}

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  hint?: string;
  actions: ConfirmationDialogAction[];
  onClose: () => void;
  iconName?: React.ComponentProps<typeof Lucide>['name'];
  /** Controls the icon badge colour scheme. 'destructive' shows a red badge; defaults to brand blue. */
  variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  hint,
  actions,
  onClose,
  iconName = 'alert-circle',
  variant = 'default',
}: ConfirmationDialogProps) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(40);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.96);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 22,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  const isDestructiveVariant = variant === 'destructive';

  const iconBadgeBg = isDestructiveVariant
    ? COLORS.semantic.errorBg
    : COLORS.brand[100];
  const iconBadgeBorder = isDestructiveVariant
    ? COLORS.semantic.errorBorder
    : 'rgba(77, 115, 255, 0.25)';
  const iconColor = isDestructiveVariant
    ? COLORS.semantic.error
    : COLORS.brand[600];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Tap outside to dismiss */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Top accent stripe */}
          <View
            style={[
              styles.accentLine,
              isDestructiveVariant && styles.accentLineDestructive,
            ]}
          />

          {/* Icon badge */}
          <View style={styles.iconBadgeWrapper}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: iconBadgeBg, borderColor: iconBadgeBorder },
              ]}
            >
              <Lucide name={iconName} size={28} color={iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Optional hint */}
          {hint !== undefined && hint.length > 0 && (
            <View style={styles.hintRow}>
              <Lucide
                name="info"
                size={13}
                color={COLORS.neutral[400]}
                style={styles.hintIcon}
              />
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => {
              const isCancel = action.style === 'cancel';
              const isActionDestructive = action.style === 'destructive';

              if (isCancel) {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onPress}
                    style={styles.cancelButton}
                    activeOpacity={0.65}
                  >
                    {action.iconName !== undefined && (
                      <Lucide
                        name={action.iconName}
                        size={15}
                        color={COLORS.neutral[400]}
                        style={styles.btnIcon}
                      />
                    )}
                    <Text style={styles.cancelButtonText}>{action.text}</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  activeOpacity={0.82}
                  style={[
                    styles.button,
                    isActionDestructive
                      ? styles.destructiveButton
                      : styles.primaryButton,
                  ]}
                >
                  {action.iconName !== undefined && (
                    <Lucide
                      name={action.iconName}
                      size={16}
                      color={COLORS.neutral.white}
                      style={styles.btnIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.buttonText,
                      isActionDestructive
                        ? styles.destructiveButtonText
                        : styles.primaryButtonText,
                    ]}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 17, 50, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 28,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.modal,
    ...Platform.select({
      web: {
        boxShadow:
          '0 25px 50px -12px rgba(10, 27, 102, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.7)',
      },
    }),
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.brand[600],
    borderTopLeftRadius: RADIUS.dialog,
    borderTopRightRadius: RADIUS.dialog,
  },
  accentLineDestructive: {
    backgroundColor: COLORS.semantic.error,
  },
  iconBadgeWrapper: {
    alignItems: 'center',
    marginTop: SPACING[8],
    marginBottom: SPACING[20],
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      },
    }),
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[8],
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[12],
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[12],
    marginBottom: SPACING[4],
    gap: 5,
  },
  hintIcon: {
    marginTop: 1,
  },
  hintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginVertical: SPACING[20],
    marginHorizontal: -SPACING[4],
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: SPACING[8],
  },
  button: {
    height: 48,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s ease',
      },
    }),
  },
  primaryButton: {
    backgroundColor: COLORS.brand[800],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(18, 54, 168, 0.28)',
      },
    }),
  },
  primaryButtonText: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 15,
  },
  destructiveButton: {
    backgroundColor: COLORS.semantic.error,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.28)',
      },
    }),
  },
  destructiveButtonText: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 15,
  },
  cancelButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cancelButtonText: {
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
    fontSize: 14,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  btnIcon: {},
});
