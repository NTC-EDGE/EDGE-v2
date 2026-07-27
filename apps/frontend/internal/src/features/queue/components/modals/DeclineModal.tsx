import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface DeclineModalProps {
  visible: boolean;
  applicantName: string;
  onConfirm: (noticeText: string) => void;
  onCancel: () => void;
}

export function DeclineModal({ visible, applicantName, onConfirm, onCancel }: DeclineModalProps) {
  const [noticeText, setNoticeText] = useState('');
  const canSubmit = noticeText.trim().length > 10;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(noticeText);
      setNoticeText('');
    }
  };

  const handleCancel = () => {
    setNoticeText('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.iconWrapper}>
            <Lucide name="x-circle" size={32} color={COLORS.semantic.error} />
          </View>
          <Text style={styles.title}>Decline Application</Text>
          <Text style={styles.subtitle}>
            Declining the application for{' '}
            <Text style={styles.highlightName}>{applicantName}</Text>.
            {'\n'}Please provide a Notice of Discrepancy.
          </Text>

          {/* Text Area */}
          <View style={styles.textAreaWrapper}>
            <Text style={styles.label}>Notice of Discrepancy <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={5}
              placeholder="Describe the discrepancy or reason for declining this application..."
              placeholderTextColor={COLORS.neutral[400]}
              value={noticeText}
              onChangeText={setNoticeText}
              textAlignVertical="top"
            />
            <Text style={styles.charHint}>
              {noticeText.trim().length < 10
                ? `${10 - noticeText.trim().length} more characters required`
                : `${noticeText.trim().length} characters`}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !canSubmit && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!canSubmit}
            >
              <Lucide name="x" size={16} color={COLORS.neutral.white} />
              <Text style={styles.confirmText}>Decline Application</Text>
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
    maxWidth: 480,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.semantic.errorBg,
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
    marginBottom: SPACING[20],
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  textAreaWrapper: {
    width: '100%',
    marginBottom: SPACING[24],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
    marginBottom: SPACING[8],
  },
  required: {
    color: COLORS.semantic.error,
  },
  textArea: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    padding: SPACING[12],
    minHeight: 120,
    lineHeight: 22,
  },
  charHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: SPACING[4],
    textAlign: 'right',
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
    backgroundColor: COLORS.semantic.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[8],
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
