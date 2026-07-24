import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

export type ModalType =
  | 'edit-config'
  | 'add-branch'
  | 'add-requirement'
  | 'edit-requirement'
  | 'add-fee'
  | 'edit-fee'
  | 'add-note'
  | 'edit-note'
  | 'add-form'
  | 'none';

interface AdminSettingsModalProps {
  visible: boolean;
  type: ModalType;
  initialData?: {
    id?: string;
    title?: string;
    name?: string;
    subLabel?: string;
    amount?: number;
    instructions?: string;
    code?: string;
    type?: string;
  };
  onClose: () => void;
  onSave: (data: {
    title: string;
    name: string;
    subLabel: string;
    amount: number;
    instructions: string;
  }) => void;
}

export function AdminSettingsModal({
  visible,
  type,
  initialData,
  onClose,
  onSave,
}: AdminSettingsModalProps) {
  const [titleInput, setTitleInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [subLabelInput, setSubLabelInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');

  useEffect(() => {
    if (visible && initialData !== undefined && initialData !== null) {
      setTitleInput(initialData.title ?? '');
      setNameInput(initialData.name ?? '');
      setSubLabelInput(initialData.subLabel ?? '');
      setAmountInput(initialData.amount !== undefined ? String(initialData.amount) : '');
      setInstructionsInput(initialData.instructions ?? '');
    } else {
      setTitleInput('');
      setNameInput('');
      setSubLabelInput('');
      setAmountInput('');
      setInstructionsInput('');
    }
  }, [visible, initialData]);

  if (!visible || type === 'none') return null;

  const getModalTitle = () => {
    switch (type) {
      case 'edit-config':
        return 'Edit Regional Configuration';
      case 'add-branch':
        return 'Add Regional Branch Office';
      case 'add-requirement':
        return 'Add Application Requirement';
      case 'edit-requirement':
        return 'Edit Application Requirement';
      case 'add-fee':
        return 'Configure New Application Fee';
      case 'edit-fee':
        return 'Edit Fee Configuration';
      case 'add-note':
        return 'Add Guidance Note';
      case 'edit-note':
        return 'Edit Guidance Note';
      case 'add-form':
        return 'Build New Form';
      default:
        return 'Admin Settings';
    }
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amountInput);
    onSave({
      title: titleInput,
      name: nameInput,
      subLabel: subLabelInput,
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
      instructions: instructionsInput,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView contentContainerStyle={styles.formContainer}>
            {/* Conditional fields based on modal type */}
            {(type === 'add-requirement' ||
              type === 'edit-requirement' ||
              type === 'add-fee' ||
              type === 'edit-fee' ||
              type === 'add-note' ||
              type === 'edit-note' ||
              type === 'add-form') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service / Application Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Amateur Radio Operator Certificate (NEW)"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={titleInput}
                  onChangeText={setTitleInput}
                />
              </View>
            )}

            {(type === 'edit-config' || type === 'add-branch') && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Office / Official Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Atty. Ella Blanca B. Lopez"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={nameInput}
                    onChangeText={setNameInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sub-Label / Designatory Details</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Regional Commissioner / (088) 856-1234"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={subLabelInput}
                    onChangeText={setSubLabelInput}
                  />
                </View>
              </>
            )}

            {(type === 'add-fee' || type === 'edit-fee') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Fee Amount (₱)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 250.00"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="numeric"
                  value={amountInput}
                  onChangeText={setAmountInput}
                />
              </View>
            )}

            {(type === 'add-note' || type === 'edit-note') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Instruction Remarks / Guidance Text</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter detailed guidance remarks shown to clients..."
                  placeholderTextColor={COLORS.neutral[400]}
                  multiline
                  numberOfLines={4}
                  value={instructionsInput}
                  onChangeText={setInstructionsInput}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.section,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.circle,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[700],
  },
  textInput: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[300],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    height: 44,
    color: COLORS.neutral[900],
  },
  textArea: {
    height: 100,
    paddingTop: SPACING[12],
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[200],
  },
  cancelBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[800],
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: SPACING[24],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[600],
  },
  saveBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
});
