import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';

interface DeleteAdminItemModalProps {
  visible: boolean;
  itemTitle: string;
  itemType?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAdminItemModal({
  visible,
  itemTitle,
  itemType = 'item',
  onClose,
  onConfirm,
}: DeleteAdminItemModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            isMobile && styles.modalCardMobile,
            SHADOWS.modal,
          ]}
        >
          {/* Danger Alert Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : COLORS.semantic.errorBg },
            ]}
          >
            <Lucide name="alert-triangle" size={24} color={COLORS.semantic.error} />
          </View>

          {/* Title & Body */}
          <Text style={[styles.title, { color: colors.text }]}>Confirm Action</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Are you sure you want to modify or delete{' '}
            <Text style={[styles.boldText, { color: colors.text }]}>{itemTitle}</Text>? This action requires administrator permissions and cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelBtn,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
                pressed && { opacity: 0.7 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { opacity: 0.8 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Lucide name="trash-2" size={15} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>Confirm {itemType}</Text>
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
  boldText: {
    fontWeight: '700',
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
  deleteBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral.white,
  },
});
