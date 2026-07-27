import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface ApproveModalProps {
  visible: boolean;
  applicantName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveModal({ visible, applicantName, onConfirm, onCancel }: ApproveModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.iconWrapper}>
            <Lucide name="check-circle" size={32} color={COLORS.semantic.success} />
          </View>
          <Text style={styles.title}>Approve Application</Text>
          <Text style={styles.subtitle}>
            You are about to approve the application for{' '}
            <Text style={styles.highlightName}>{applicantName}</Text>.
            {'\n'}This action cannot be undone.
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
              <Lucide name="check" size={16} color={COLORS.neutral.white} />
              <Text style={styles.confirmText}>Confirm Approval</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[24],
  },
  container: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    padding: SPACING[32],
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.semantic.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[16],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[8],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[24],
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
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
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
