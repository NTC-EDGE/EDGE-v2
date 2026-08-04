import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, Icon as Lucide, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import type { Role } from '../types';

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
  const { colors, isDark } = useTheme();

  if (!visible || role === null) return null;

  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];

  const handleConfirm = () => {
    onConfirmDelete(role.id);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: cardBg }, SHADOWS.modal]}>
          {/* Warning Icon */}
          <View style={styles.iconWrapper}>
            <Lucide name="alert-triangle" size={28} color="#EF4444" />
          </View>

          <Text style={[styles.title, { color: textColor }]}>Delete Role</Text>
          <Text style={[styles.message, { color: mutedColor }]}>
            Are you sure you want to delete the role{' '}
            <Text style={[styles.roleName, { color: textColor }]}>{role.name}</Text>? Users
            assigned to this role will lose their permission scope.
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.actions}>
            <Pressable
              style={[styles.cancelBtn, { borderColor }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: textColor }]}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.deleteBtn} onPress={handleConfirm}>
              <Lucide name="trash-2" size={14} color="#FFFFFF" />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[24],
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.dialog,
    padding: SPACING[24],
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING[8],
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[20],
  },
  roleName: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
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
    paddingVertical: 11,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[6],
    paddingVertical: 11,
    borderRadius: RADIUS.button,
    backgroundColor: '#EF4444',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
