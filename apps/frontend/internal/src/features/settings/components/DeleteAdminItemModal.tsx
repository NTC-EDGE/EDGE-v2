import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Danger Alert Icon */}
          <View style={styles.iconContainer}>
            <Lucide name="alert-triangle" size={24} color={COLORS.semantic.error} />
          </View>

          {/* Title & Body */}
          <Text style={styles.title}>Confirm Deletion</Text>
          <Text style={styles.description}>
            Are you sure you want to delete{' '}
            <Text style={styles.boldText}>{itemTitle}</Text>? This action requires administrator permissions and cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Lucide name="trash-2" size={15} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>Delete {itemType}</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
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
    backgroundColor: COLORS.semantic.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[8],
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[24],
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.neutral[900],
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
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
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
