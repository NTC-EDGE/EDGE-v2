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
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { Employee } from '../types/employeeTypes';

interface DeleteConfirmModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (employee: Employee) => void;
}

export function DeleteConfirmModal({
  visible,
  employee,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!visible || employee === null || employee === undefined) {
    return null;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <Lucide name="alert-triangle" size={24} color={COLORS.semantic.error} />
          </View>

          {/* Title & Body */}
          <Text style={styles.title}>Remove Employee from Tenant</Text>
          <Text style={styles.description}>
            Are you sure you want to remove employee{' '}
            <Text style={styles.boldText}>
              {employee.firstName} {employee.lastName}
            </Text>{' '}
            ({employee.id}) from this regional office? This action will revoke their tenant role permissions and workstation deployment. Their user account will remain active on the platform.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                onConfirm(employee);
                onClose();
              }}
            >
              <Lucide name="user-minus" size={15} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>Remove Employee</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    width: '100%',
    maxWidth: 480,
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
    fontWeight: TYPOGRAPHY.weights.bold,
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
    fontWeight: TYPOGRAPHY.weights.semibold,
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
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
