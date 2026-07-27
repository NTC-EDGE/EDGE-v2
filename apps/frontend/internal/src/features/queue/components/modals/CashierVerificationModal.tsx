import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TextInput } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface CashierVerificationModalProps {
  visible: boolean;
  applicantName: string;
  initialOrNumber?: string;
  onConfirm: (data: { orNumber: string; checkNumber: string; checkName: string }) => void;
  onCancel: () => void;
}

export function CashierVerificationModal({
  visible,
  applicantName,
  initialOrNumber,
  onConfirm,
  onCancel,
}: CashierVerificationModalProps) {
  const [orNumber, setOrNumber] = useState(initialOrNumber ?? '');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkName, setCheckName] = useState('');

  const canSubmit =
    orNumber.trim().length > 0 &&
    checkNumber.trim().length > 0 &&
    checkName.trim().length > 0;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm({
        orNumber: orNumber.trim(),
        checkNumber: checkNumber.trim(),
        checkName: checkName.trim(),
      });
      setOrNumber('');
      setCheckNumber('');
      setCheckName('');
    }
  };

  const handleCancel = () => {
    setOrNumber(initialOrNumber ?? '');
    setCheckNumber('');
    setCheckName('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Lucide name="credit-card" size={28} color="#059669" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Cashier Verification</Text>
              <Text style={styles.subtitle}>
                Enter payment details for{' '}
                <Text style={styles.highlightName}>{applicantName}</Text>&apos;s application.
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Fields */}
          <View style={styles.fields}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                OR Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Lucide name="hash" size={15} color={COLORS.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. OR-884920-2026"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={orNumber}
                  onChangeText={setOrNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Check Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Lucide name="file-text" size={15} color={COLORS.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CHK-00912384"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={checkNumber}
                  onChangeText={setCheckNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Check Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Lucide name="user" size={15} color={COLORS.neutral[400]} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Metrobank"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={checkName}
                  onChangeText={setCheckName}
                />
              </View>
            </View>
          </View>

          {/* Required note */}
          <Text style={styles.requiredNote}>
            <Text style={styles.required}>*</Text> All fields are required
          </Text>

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
              <Lucide name="check" size={16} color={COLORS.neutral.white} />
              <Text style={styles.confirmText}>Verify Payment</Text>
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
    padding: SPACING[24],
    width: '100%',
    maxWidth: 480,
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[16],
    marginBottom: SPACING[16],
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    lineHeight: 20,
  },
  highlightName: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginBottom: SPACING[20],
  },
  fields: {
    gap: SPACING[16],
    marginBottom: SPACING[12],
  },
  fieldGroup: {
    gap: SPACING[8],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  required: {
    color: COLORS.semantic.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
    outline: 'none',
  } as unknown as object,
  requiredNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginBottom: SPACING[20],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[12],
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
    backgroundColor: '#059669',
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
