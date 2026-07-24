import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Switch,
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

export interface ModalInitialData {
  id?: string;
  category?: string;
  title?: string;
  name?: string;
  subLabel?: string;
  code?: string;
  branchType?: 'Main Office' | 'Field Office';
  amount?: number;
  instructions?: string;
  isActive?: boolean;
}

interface AdminSettingsModalProps {
  visible: boolean;
  type: ModalType;
  initialData?: ModalInitialData;
  onClose: () => void;
  onSave: (data: {
    title: string;
    name: string;
    subLabel: string;
    code: string;
    branchType: 'Main Office' | 'Field Office';
    amount: number;
    instructions: string;
    isActive: boolean;
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
  const [codeInput, setCodeInput] = useState('');
  const [branchType, setBranchType] = useState<'Main Office' | 'Field Office'>('Main Office');
  const [amountInput, setAmountInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');
  const [isActiveToggle, setIsActiveToggle] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible && initialData !== undefined && initialData !== null) {
      setTitleInput(initialData.title ?? '');
      setNameInput(initialData.name ?? '');
      setSubLabelInput(initialData.subLabel ?? '');
      setCodeInput(initialData.code ?? 'ZC-001');
      setBranchType(initialData.branchType === 'Field Office' ? 'Field Office' : 'Main Office');
      setAmountInput(initialData.amount !== undefined ? String(initialData.amount) : '');
      setInstructionsInput(initialData.instructions ?? '');
      setIsActiveToggle(initialData.isActive ?? true);
    } else {
      setTitleInput('');
      setNameInput('');
      setSubLabelInput('');
      setCodeInput('');
      setBranchType('Main Office');
      setAmountInput('');
      setInstructionsInput('');
      setIsActiveToggle(true);
    }
    setIsCategoryDropdownOpen(false);
  }, [visible, initialData]);

  if (!visible || type === 'none') return null;

  const categoryName = initialData?.category ?? '';

  const getModalTitle = () => {
    switch (type) {
      case 'edit-config':
        if (categoryName === 'Commissioner') return 'Edit Commissioner';
        if (categoryName === 'Support Contact') return 'Edit Support Contact';
        if (categoryName === 'Office Details') return 'Edit Office Details';
        if (categoryName === 'Region Summary') return 'Edit Region Summary';
        return 'Edit Regional Configuration';
      case 'add-branch':
        return initialData?.id ? 'Edit Regional Branch Office' : 'Add Regional Branch Office';
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
      code: codeInput,
      branchType,
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
      instructions: instructionsInput,
      isActive: isActiveToggle,
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
              <Lucide name="x" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* 1. Regional Config Modal Fields (Screenshot 1) */}
            {type === 'edit-config' && (
              <>
                {categoryName === 'Commissioner' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>FULL NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Atty. Ella Blanca B. Lopez"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>TITLE</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Regional Commissioner"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Active Commissioner</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Support Contact' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>HELPDESK NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Main Helpdesk"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>EMAIL & PHONE DETAILS</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ntc10@gov.ph · (02) 8-123-4567"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Office Details' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>OFFICE NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="NTC Region X"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>ROUTING KEYS / CODES</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="B5099 · 43A"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Primary Office</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}

                {categoryName === 'Region Summary' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>REGION NAME</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Region XIV"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={nameInput}
                        onChangeText={setNameInput}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>GLOBAL CONFIG & ALERTS</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="XIV · Alerts: off"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={subLabelInput}
                        onChangeText={setSubLabelInput}
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Mark as Active Region</Text>
                      <Switch
                        value={isActiveToggle}
                        onValueChange={setIsActiveToggle}
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActiveToggle ? '#4F46E5' : '#FFFFFF'}
                      />
                    </View>
                  </>
                )}
              </>
            )}

            {/* 2. Regional Branch Office Modal Fields (Screenshot 2) */}
            {type === 'add-branch' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH NAME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Zamboanga City Main Office"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={nameInput}
                    onChangeText={setNameInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CODE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ZC-001"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={codeInput}
                    onChangeText={setCodeInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BRANCH CATEGORY</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <Text style={styles.dropdownTriggerText}>{branchType}</Text>
                    <Lucide
                      name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </Pressable>

                  {isCategoryDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      <Pressable
                        style={[
                          styles.dropdownOption,
                          branchType === 'Main Office' && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setBranchType('Main Office');
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>Main Office</Text>
                        {branchType === 'Main Office' && (
                          <Lucide name="check" size={16} color="#4F46E5" />
                        )}
                      </Pressable>

                      <Pressable
                        style={[
                          styles.dropdownOption,
                          branchType === 'Field Office' && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setBranchType('Field Office');
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>Field Office</Text>
                        {branchType === 'Field Office' && (
                          <Lucide name="check" size={16} color="#4F46E5" />
                        )}
                      </Pressable>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Other modal types */}
            {(type === 'add-requirement' ||
              type === 'edit-requirement' ||
              type === 'add-fee' ||
              type === 'edit-fee' ||
              type === 'add-note' ||
              type === 'edit-note' ||
              type === 'add-form') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SERVICE / APPLICATION TITLE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Amateur Radio Operator Certificate (NEW)"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={titleInput}
                  onChangeText={setTitleInput}
                />
              </View>
            )}

            {(type === 'add-fee' || type === 'edit-fee') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TOTAL FEE AMOUNT (₱)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="250.00"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="numeric"
                  value={amountInput}
                  onChangeText={setAmountInput}
                />
              </View>
            )}

            {(type === 'add-note' || type === 'edit-note') && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>INSTRUCTION REMARKS / GUIDANCE TEXT</Text>
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

          {/* Footer Buttons (Exact Match to Screenshots 1 & 2) */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: SPACING[24],
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: SPACING[16],
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: SPACING[12],
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: SPACING[16],
    height: 48,
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownMenu: {
    backgroundColor: COLORS.neutral.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionActive: {
    backgroundColor: '#F8FAFC',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    marginTop: SPACING[24],
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: '#334155',
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '700',
  },
});
