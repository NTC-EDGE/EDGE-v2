import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/tokens';

export interface ConfirmationDialogAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmationDialogAction[];
  onClose: () => void;
  iconName?: React.ComponentProps<typeof Lucide>['name'];
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  actions,
  onClose,
  iconName = 'alert-circle',
}: ConfirmationDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Decorative Accent Line */}
          <View style={styles.accentLine} />

          {/* Header Area with Icon Container */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Lucide name={iconName} size={24} color={COLORS.brand[600]} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Message Area */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Area */}
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => {
              const isDestructive = action.style === 'destructive';
              const isCancel = action.style === 'cancel';

              if (isCancel) {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={action.onPress}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>{action.text}</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  style={[
                    styles.button,
                    isDestructive ? styles.destructiveButton : styles.primaryButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive ? styles.destructiveButtonText : styles.primaryButtonText,
                    ]}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
    margin: 0,
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1,
    borderRadius: RADIUS.dialog || 16,
    width: '100%',
    maxWidth: 420,
    padding: SPACING[32],
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.brand[500] || '#2563eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[16],
    gap: SPACING[16],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.brand[100] || '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900] || '#0f172a',
    flex: 1,
  },
  message: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600] || '#475569',
    marginBottom: SPACING[24],
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: SPACING[12],
  },
  button: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  primaryButton: {
    backgroundColor: COLORS.brand[900] || '#1d4ed8',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(29, 78, 216, 0.15)',
      },
    }),
  },
  primaryButtonText: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 14,
  },
  destructiveButton: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: COLORS.semantic?.error || '#ef4444',
  },
  destructiveButtonText: {
    color: COLORS.semantic?.error || '#ef4444',
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 14,
  },
  cancelButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING[4],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cancelButtonText: {
    color: COLORS.neutral[500] || '#64748b',
    fontWeight: TYPOGRAPHY.weights.medium,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
});
