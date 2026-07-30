import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { User, AccountType, UserStatus } from '../data/mockUsers';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'> & { id?: string }) => void;
  userToEdit?: User | null;
}

const PHILIPPINE_REGIONS = [
  'NCR',
  'CAR',
  'Region I',
  'Region II',
  'Region III',
  'Region IV-A',
  'MIMAROPA',
  'Region V',
  'Region VI',
  'Region VII',
  'Region VIII',
  'Region IX',
  'Region X',
  'Region XI',
  'Region XII',
  'Region XIII',
  'BARMM',
];

const parseName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  } else if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1] };
  } else {
    const firstName = parts[0];
    const middleName = parts.slice(1, parts.length - 1).join(' ');
    const lastName = parts[parts.length - 1];
    return { firstName, middleName, lastName };
  }
};

export function UserFormModal({ isOpen, onClose, onSubmit, userToEdit }: UserFormModalProps) {
  const isEditing = userToEdit !== null && userToEdit !== undefined;
  const { width } = useWindowDimensions();
  const isMobileSize = width < 540;

  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Individual');
  const [region, setRegion] = useState('Region X');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [applicationsCount, setApplicationsCount] = useState('1');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (userToEdit !== null && userToEdit !== undefined) {
      if (userToEdit.accountType === 'Company') {
        setCompanyName(userToEdit.name);
        setFirstName('');
        setMiddleName('');
        setLastName('');
      } else {
        const parsed = parseName(userToEdit.name);
        setFirstName(parsed.firstName);
        setMiddleName(parsed.middleName);
        setLastName(parsed.lastName);
        setCompanyName('');
      }
      setEmail(userToEdit.email);
      setAccountType(userToEdit.accountType);
      setRegion(userToEdit.region);
      setPhone(userToEdit.phone);
      setAddress(userToEdit.address);
      setApplicationsCount(userToEdit.applicationsCount.toString());
      setStatus(userToEdit.status);
      setDescription(userToEdit.description || '');
      setPassword(userToEdit.password || '');
    } else {
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setCompanyName('');
      setEmail('');
      setAccountType('Individual');
      setRegion('Region X');
      setPhone('');
      setAddress('');
      setApplicationsCount('1');
      setStatus('Active');
      setDescription('');
      setPassword('');
    }
    setErrors({});
    setIsRegionDropdownOpen(false);
    setShowPassword(false);
  }, [userToEdit, isOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (accountType === 'Company') {
      if (companyName.trim().length === 0) {
        newErrors.companyName = 'Company name is required.';
      }
    } else {
      if (firstName.trim().length === 0) {
        newErrors.firstName = 'First name is required.';
      }
      if (lastName.trim().length === 0) {
        newErrors.lastName = 'Last name is required.';
      }
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

    const resolvedName =
      accountType === 'Company'
        ? companyName.trim()
        : [firstName.trim(), middleName.trim(), lastName.trim()]
            .filter(Boolean)
            .join(' ');

    const avatarInitials = accountType === 'Company' ? resolvedName.slice(0, 2).toUpperCase() : undefined;

    onSubmit({
      ...(isEditing && userToEdit !== null && userToEdit !== undefined ? { id: userToEdit.id } : {}),
      name: resolvedName,
      email: email.trim(),
      accountType,
      avatarType: accountType === 'Individual' ? 'icon' : 'initials',
      avatarInitials,
      avatarBgColor: accountType === 'Company' ? COLORS.brand.royalBlue : undefined,
      region,
      phone: phone.trim() || '+63 900 000 0000',
      address: address.trim() || 'N/A',
      applicationsCount: validApps,
      status,
      createdDate: isEditing && userToEdit ? userToEdit.createdDate : new Date().toISOString().split('T')[0],
      description: description.trim(),
      ...(password.trim().length > 0 ? { password: password.trim() } : {}),
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
            {accountType === 'Company' ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Company Name *</Text>
                <TextInput
                  style={[styles.input, errors.companyName !== undefined && styles.inputError]}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="e.g. Ching's Collection"
                  placeholderTextColor={COLORS.neutral[400]}
                />
                {errors.companyName !== undefined && <Text style={styles.errorText}>{errors.companyName}</Text>}
              </View>
            ) : (
              <View style={styles.formGroup}>
                <View style={[styles.formRow, isMobileSize && { flexDirection: 'column', gap: 0 }]}>
                  <View style={[styles.formGroup, !isMobileSize && styles.flex2]}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                      style={[styles.input, errors.firstName !== undefined && styles.inputError]}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="e.g. Edward"
                      placeholderTextColor={COLORS.neutral[400]}
                    />
                    {errors.firstName !== undefined && <Text style={styles.errorText}>{errors.firstName}</Text>}
                  </View>

                  <View style={[styles.formGroup, !isMobileSize && styles.flex1]}>
                    <Text style={styles.label}>Middle Name</Text>
                    <TextInput
                      style={styles.input}
                      value={middleName}
                      onChangeText={setMiddleName}
                      placeholder="e.g. Lance"
                      placeholderTextColor={COLORS.neutral[400]}
                    />
                  </View>

                  <View style={[styles.formGroup, !isMobileSize && styles.flex2]}>
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                      style={[styles.input, errors.lastName !== undefined && styles.inputError]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="e.g. Lorilla"
                      placeholderTextColor={COLORS.neutral[400]}
                    />
                    {errors.lastName !== undefined && <Text style={styles.errorText}>{errors.lastName}</Text>}
                  </View>
                </View>
              </View>
            )}

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
            <View style={[styles.formGroup, { zIndex: isRegionDropdownOpen ? 100 : 1 }]}>
              <Text style={styles.label}>Region *</Text>
              <Pressable
                style={[styles.dropdownTrigger, isRegionDropdownOpen && styles.dropdownTriggerActive]}
                onPress={() => setIsRegionDropdownOpen((prev) => !prev)}
              >
                <Text style={styles.dropdownTriggerText}>{region || 'Select Region'}</Text>
                <Lucide
                  name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.neutral[600]}
                />
              </Pressable>

              {isRegionDropdownOpen && (
                <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {PHILIPPINE_REGIONS.map((r) => (
                      <Pressable
                        key={r}
                        style={[
                          styles.dropdownOption,
                          region === r && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setRegion(r);
                          setIsRegionDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            region === r && styles.dropdownOptionTextActive,
                          ]}
                        >
                          {r}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+63 917 000 0000"
                placeholderTextColor={COLORS.neutral[400]}
              />
            </View>

            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWithIconWrapper}>
                <TextInput
                  style={[styles.input, { paddingRight: 45 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.neutral[400]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  style={styles.eyeIconButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Lucide name={showPassword ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                </Pressable>
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
    backgroundColor: COLORS.brand.light,
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
    backgroundColor: COLORS.brand.light,
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

  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownTriggerActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral.white,
  },
  dropdownTriggerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownOption: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 10,
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.brand.light,
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  dropdownOptionTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
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
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  inputWithIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIconButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});
