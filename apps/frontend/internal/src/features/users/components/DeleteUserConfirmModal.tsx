import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { User } from '../types';

interface DeleteUserConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

export function DeleteUserConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
}: DeleteUserConfirmModalProps) {
  if (!isOpen || user === null) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          <View style={styles.iconCircle}>
            <Lucide name="alert-triangle" size={28} color={COLORS.semantic.error} />
          </View>

          <Text style={styles.title}>Archive Permittee Record</Text>
          <Text style={styles.message}>
            Are you sure you want to archive regulatory record for <Text style={styles.highlightText}>{user.name}</Text> (Permittee ID: {user.id})? This will deactivate their regional filing records.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={onConfirm}>
              <Text style={styles.deleteBtnText}>Archive Record</Text>
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
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.semantic.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[8],
  },
  message: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[24],
  },
  highlightText: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.error,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
