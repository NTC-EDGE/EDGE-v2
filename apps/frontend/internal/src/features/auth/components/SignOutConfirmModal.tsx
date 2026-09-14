import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from '@edge/ui';

export interface SignOutConfirmModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function SignOutConfirmModal({
  visible,
  loading = false,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            isMobile && styles.modalCardMobile,
            SHADOWS.modal,
          ]}
        >
          {/* Sign Out Danger / Warning Badge */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.15)'
                  : COLORS.semantic.errorBg,
              },
            ]}
          >
            <Lucide
              name="log-out"
              size={26}
              color={COLORS.semantic.error}
            />
          </View>

          {/* Title & Body */}
          <Text style={[styles.title, { color: colors.text }]}>
            Confirm Sign Out
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Are you sure you want to sign out of the NTC EDGE Workstation? Any unsaved changes in your active tasks may be lost.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              disabled={loading}
              style={({ pressed }) => [
                styles.cancelBtn,
                {
                  backgroundColor: isDark
                    ? colors.neutral[800]
                    : colors.neutral[100],
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.7 },
                loading && { opacity: 0.5 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              style={({ pressed }) => [
                styles.confirmBtn,
                pressed && { opacity: 0.8 },
                loading && { opacity: 0.7 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={() => {
                const res = onConfirm();
                if (res instanceof Promise) {
                  res.catch((err: unknown) => {
                    console.error('Sign out error:', err);
                  });
                }
              }}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.neutral.white}
                  style={styles.loadingSpinner}
                />
              ) : (
                <Lucide
                  name="log-out"
                  size={15}
                  color={COLORS.neutral.white}
                  style={styles.btnIcon}
                />
              )}
              <Text style={styles.confirmBtnText}>
                {loading ? 'Signing out...' : 'Sign Out'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    width: '100%',
    maxWidth: 440,
    padding: SPACING[24],
    alignSelf: 'center',
    alignItems: 'center',
  },
  modalCardMobile: {
    maxWidth: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING[8],
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[24],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1.2,
    height: 42,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
  btnIcon: {
    marginRight: 6,
  },
  loadingSpinner: {
    marginRight: 6,
  },
});
