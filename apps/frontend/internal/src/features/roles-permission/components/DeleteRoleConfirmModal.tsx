import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { Role } from '../data/mockRolesPermissions';

interface DeleteRoleConfirmModalProps {
  visible: boolean;
  role: Role | null;
  onClose: () => void;
  onConfirmDelete: (roleId: string) => void;
}

export function DeleteRoleConfirmModal({
  visible,
  role,
  onClose,
  onConfirmDelete,
}: DeleteRoleConfirmModalProps) {
  if (!visible || role === null) return null;

  const handleConfirm = () => {
    onConfirmDelete(role.id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          <View style={styles.iconWrapper}>
            <Lucide name="alert-triangle" size={28} color={COLORS.semantic.error} />
          </View>

          <Text style={styles.title}>Delete Role</Text>
          <Text style={styles.message}>
            Are you sure you want to delete the role <Text style={styles.roleBold}>{role.name}</Text>? User accounts currently assigned to this role will lose their permission scope.
          </Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.deleteBtn} onPress={handleConfirm}>
              <Text style={styles.deleteBtnText}>Delete Role</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.semantic.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: SPACING[8],
  },
  message: {
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[24],
  },
  roleBold: {
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
});
