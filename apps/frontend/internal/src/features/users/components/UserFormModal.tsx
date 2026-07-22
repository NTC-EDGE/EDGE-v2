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
import { User, AccountType, UserStatus } from '../data/mockUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'> & { id?: string }) => void;
  userToEdit?: User | null;
}

export function UserFormModal({ isOpen, onClose, onSubmit, userToEdit }: UserFormModalProps) {
  const isEditing = userToEdit !== null && userToEdit !== undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Individual');
  const [region, setRegion] = useState('Region X');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [applicationsCount, setApplicationsCount] = useState('1');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (userToEdit !== null && userToEdit !== undefined) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setAccountType(userToEdit.accountType);
      setRegion(userToEdit.region);
      setPhone(userToEdit.phone);
      setAddress(userToEdit.address);
      setApplicationsCount(userToEdit.applicationsCount.toString());
      setStatus(userToEdit.status);
      setDescription(userToEdit.description || '');
    } else {
      setName('');
      setEmail('');
      setAccountType('Individual');
      setRegion('Region X');
      setPhone('');
      setAddress('');
      setApplicationsCount('1');
      setStatus('Active');
      setDescription('');
    }
    setErrors({});
  }, [userToEdit, isOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (name.trim().length === 0) {
      newErrors.name = 'Client name is required.';
    }
    if (email.trim().length === 0) {
      newErrors.email = 'Email address is required.';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (region.trim().length === 0) {
      newErrors.region = 'Region is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parsedApps = parseInt(applicationsCount, 10);
    const validApps = !isNaN(parsedApps) && parsedApps >= 0 ? parsedApps : 0;

    const avatarInitials = accountType === 'Company' ? name.slice(0, 2).toUpperCase() : undefined;

    onSubmit({
      ...(isEditing && userToEdit !== null && userToEdit !== undefined ? { id: userToEdit.id } : {}),
      name: name.trim(),
      email: email.trim(),
      accountType,
      avatarType: accountType === 'Individual' ? 'icon' : 'initials',
      avatarInitials,
      avatarBgColor: accountType === 'Company' ? '#1D4ED8' : undefined,
      region,
      phone: phone.trim() || '+63 900 000 0000',
      address: address.trim() || 'N/A',
      applicationsCount: validApps,
      status,
      createdDate: isEditing && userToEdit ? userToEdit.createdDate : new Date().toISOString().split('T')[0],
      description: description.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, SHADOWS.modal]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleGroup}>
              <View style={styles.modalHeaderIconBg}>
                <Lucide name={isEditing ? 'edit-2' : 'user-plus'} size={20} color={COLORS.brand[700]} />
              </View>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Client Account' : 'Add New Client User'}</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Form Scroll Area */}
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            {/* Account Type Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Type *</Text>
              <View style={styles.typeSelectorRow}>
                <Pressable
                  style={[styles.typeOption, accountType === 'Individual' && styles.typeOptionSelected]}
                  onPress={() => setAccountType('Individual')}
                >
                  <Lucide
                    name="user"
                    size={16}
                    color={accountType === 'Individual' ? COLORS.brand[700] : COLORS.neutral[600]}
                    style={styles.typeIcon}
                  />
                  <Text style={[styles.typeOptionText, accountType === 'Individual' && styles.typeOptionTextSelected]}>
                    Individual
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.typeOption, accountType === 'Company' && styles.typeOptionSelected]}
                  onPress={() => setAccountType('Company')}
                >
                  <Lucide
                    name="briefcase"
                    size={16}
                    color={accountType === 'Company' ? COLORS.brand[700] : COLORS.neutral[600]}
                    style={styles.typeIcon}
                  />
                  <Text style={[styles.typeOptionText, accountType === 'Company' && styles.typeOptionTextSelected]}>
                    Company / Enterprise
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Client Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {accountType === 'Company' ? 'Company Name *' : 'Full Name *'}
              </Text>
              <TextInput
                style={[styles.input, errors.name !== undefined && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder={accountType === 'Company' ? "e.g. Ching's Collection" : 'e.g. Edward Lance Lorilla'}
                placeholderTextColor={COLORS.neutral[400]}
              />
              {errors.name !== undefined && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email !== undefined && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="sample@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.neutral[400]}
              />
              {errors.email !== undefined && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Region Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Region *</Text>
              <View style={styles.regionSelectorRow}>
                {['NCR', 'Region I', 'Region III', 'Region VII', 'Region X'].map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.regionChip, region === r && styles.regionChipSelected]}
                    onPress={() => setRegion(r)}
                  >
                    <Text style={[styles.regionChipText, region === r && styles.regionChipTextSelected]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Phone & Applications Count */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+63 917 000 0000"
                  placeholderTextColor={COLORS.neutral[400]}
                />
              </View>

              <View style={[styles.formGroup, styles.halfCol]}>
                <Text style={styles.label}>Applications Count</Text>
                <TextInput
                  style={styles.input}
                  value={applicationsCount}
                  onChangeText={setApplicationsCount}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={COLORS.neutral[400]}
                />
              </View>
            </View>

            {/* Status Radio Buttons */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Status</Text>
              <View style={styles.statusRow}>
                {(['Active', 'Pending', 'Inactive'] as UserStatus[]).map((st) => (
                  <Pressable
                    key={st}
                    style={[styles.statusOption, status === st && styles.statusOptionSelected]}
                    onPress={() => setStatus(st)}
                  >
                    <View style={[styles.statusRadioCircle, status === st && styles.statusRadioCircleSelected]}>
                      {status === st && <View style={styles.statusRadioInner} />}
                    </View>
                    <Text style={styles.statusOptionText}>{st}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="City, Province"
                placeholderTextColor={COLORS.neutral[400]}
              />
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Create User'}</Text>
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
  modalContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
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
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  closeBtn: {
    padding: 4,
  },

  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: SPACING[24],
  },

  formGroup: {
    marginBottom: SPACING[16],
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  halfCol: {
    flex: 1,
  },

  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
    marginBottom: 6,
  },
  input: {
    height: 40,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  inputError: {
    borderColor: COLORS.semantic.error,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
    marginTop: 4,
  },

  typeSelectorRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral[50],
  },
  typeOptionSelected: {
    borderColor: COLORS.brand[600],
    backgroundColor: '#EFF6FF',
  },
  typeIcon: {
    marginRight: 6,
  },
  typeOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  typeOptionTextSelected: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  regionSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  regionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral[50],
  },
  regionChipSelected: {
    borderColor: COLORS.brand[600],
    backgroundColor: '#EFF6FF',
  },
  regionChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[700],
  },
  regionChipTextSelected: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  statusRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionSelected: {},
  statusRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusRadioCircleSelected: {
    borderColor: COLORS.brand[700],
  },
  statusRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand[700],
  },
  statusOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },

  modalFooter: {
    flexDirection: 'row',
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
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  submitBtn: {
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
