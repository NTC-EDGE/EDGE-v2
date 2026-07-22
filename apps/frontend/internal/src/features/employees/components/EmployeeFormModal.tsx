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
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  ROLES_LIST,
  REGIONS_LIST,
  DEPARTMENTS,
} from '../data/mockEmployees';

interface EmployeeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => void;
  initialEmployee?: Employee | null;
}

export function EmployeeFormModal({
  visible,
  onClose,
  onSave,
  initialEmployee = null,
}: EmployeeFormModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Form State
  const [role, setRole] = useState<EmployeeRole>('Evaluator');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [email, setEmail] = useState('');

  const [region, setRegion] = useState(REGIONS_LIST[0] || 'Central Office (Headquarters)');
  const [level, setLevel] = useState('');
  const [title, setTitle] = useState('');
  const [division, setDivision] = useState(DEPARTMENTS[0] || 'Licensing & Registration Division');
  const [position, setPosition] = useState('');
  const [designation, setDesignation] = useState('');

  const [signatureDisplay, setSignatureDisplay] = useState<'beside' | 'above'>('beside');
  const [signatureFileName, setSignatureFileName] = useState<string | null>(null);

  // Dropdown open states inside modal
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<{
    lastName?: string;
    firstName?: string;
    email?: string;
    region?: string;
    level?: string;
    title?: string;
    division?: string;
    position?: string;
  }>({});

  useEffect(() => {
    if (initialEmployee !== null && initialEmployee !== undefined) {
      setRole(initialEmployee.role);
      setLastName(initialEmployee.lastName);
      setFirstName(initialEmployee.firstName);
      setMiddleName(initialEmployee.middleName ?? '');
      setSuffix(initialEmployee.suffix ?? '');
      setEmail(initialEmployee.email);

      setRegion(initialEmployee.region ?? REGIONS_LIST[0]);
      setLevel(initialEmployee.level ?? 'Level II');
      setTitle(initialEmployee.title ?? 'Evaluator II');
      setDivision(initialEmployee.division ?? initialEmployee.department ?? DEPARTMENTS[0]);
      setPosition(initialEmployee.position ?? 'Technical Evaluator');
      setDesignation(initialEmployee.designation ?? '');

      setSignatureDisplay(initialEmployee.signatureDisplay ?? 'beside');
      setSignatureFileName(initialEmployee.signatureUri ? 'Uploaded_Signature.png' : null);
    } else {
      setRole('Evaluator');
      setLastName('');
      setFirstName('');
      setMiddleName('');
      setSuffix('');
      setEmail('');

      setRegion(REGIONS_LIST[0]);
      setLevel('');
      setTitle('');
      setDivision(DEPARTMENTS[0]);
      setPosition('');
      setDesignation('');

      setSignatureDisplay('beside');
      setSignatureFileName(null);
    }
    setErrors({});
    setIsRoleDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  }, [initialEmployee, visible]);

  const validate = (): boolean => {
    const newErrors: {
      lastName?: string;
      firstName?: string;
      email?: string;
      region?: string;
      level?: string;
      title?: string;
      division?: string;
      position?: string;
    } = {};

    if (lastName.trim().length === 0) {
      newErrors.lastName = 'Last Name is required';
    }
    if (firstName.trim().length === 0) {
      newErrors.firstName = 'First Name is required';
    }
    if (email.trim().length === 0) {
      newErrors.email = 'Email address is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Enter a valid email address';
    }
    if (region.trim().length === 0) {
      newErrors.region = 'Region is required';
    }
    if (level.trim().length === 0) {
      newErrors.level = 'Level is required';
    }
    if (title.trim().length === 0) {
      newErrors.title = 'Title is required';
    }
    if (division.trim().length === 0) {
      newErrors.division = 'Division is required';
    }
    if (position.trim().length === 0) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    lastName.trim().length > 0 &&
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes('@') &&
    region.trim().length > 0 &&
    level.trim().length > 0 &&
    title.trim().length > 0 &&
    division.trim().length > 0 &&
    position.trim().length > 0;

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave({
      role,
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      suffix: suffix.trim(),
      email: email.trim().toLowerCase(),
      region: region.trim(),
      level: level.trim(),
      title: title.trim(),
      division: division.trim(),
      department: division.trim(),
      position: position.trim(),
      designation: designation.trim(),
      signatureDisplay,
      signatureUri: signatureFileName !== null ? 'mock_signature.png' : undefined,
    });
  };

  const handleSimulateUpload = () => {
    setSignatureFileName('Employee_Signature_Signed.png');
  };

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Employee Account' : 'Add New Employee'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Create a new employee record and assign system permissions.
              </Text>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close Modal">
              <Lucide name="x-circle" size={24} color={COLORS.neutral[800]} />
            </Pressable>
          </View>

          {/* Form Scrollable Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Section 1: Role Dropdown Field */}
            <View style={[styles.inputGroup, { zIndex: 50 }]}>
              <Text style={styles.label}>Role</Text>
              <Pressable
                style={[styles.dropdownTrigger, isRoleDropdownOpen && styles.dropdownTriggerActive]}
                onPress={() => {
                  setIsRoleDropdownOpen((prev) => !prev);
                  setIsRegionDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownTriggerText}>{role}</Text>
                <Lucide
                  name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.neutral[600]}
                />
              </Pressable>

              {isRoleDropdownOpen && (
                <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                  {ROLES_LIST.map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.dropdownOption, role === r && styles.dropdownOptionActive]}
                      onPress={() => {
                        setRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          role === r && styles.dropdownOptionTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Section 2: Basic Information */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Last Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.lastName !== undefined && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor={COLORS.neutral[400]}
                value={lastName}
                onChangeText={setLastName}
              />
              {errors.lastName !== undefined && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                First Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.firstName !== undefined && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor={COLORS.neutral[400]}
                value={firstName}
                onChangeText={setFirstName}
              />
              {errors.firstName !== undefined && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Middle Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Middle Name"
                placeholderTextColor={COLORS.neutral[400]}
                value={middleName}
                onChangeText={setMiddleName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Suffix</Text>
              <TextInput
                style={styles.input}
                placeholder="Suffix"
                placeholderTextColor={COLORS.neutral[400]}
                value={suffix}
                onChangeText={setSuffix}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email !== undefined && styles.inputError]}
                placeholder="Email"
                placeholderTextColor={COLORS.neutral[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email !== undefined && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Section 3: Employee Details */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Employee Details</Text>
            </View>

            <View style={[styles.inputGroup, { zIndex: 40 }]}>
              <Text style={styles.label}>
                Region <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Pressable
                style={[styles.dropdownTrigger, isRegionDropdownOpen && styles.dropdownTriggerActive]}
                onPress={() => {
                  setIsRegionDropdownOpen((prev) => !prev);
                  setIsRoleDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownTriggerText}>{region}</Text>
                <Lucide
                  name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.neutral[600]}
                />
              </Pressable>

              {isRegionDropdownOpen && (
                <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                  <ScrollView style={{ maxHeight: 180 }}>
                    {REGIONS_LIST.map((reg) => (
                      <Pressable
                        key={reg}
                        style={[styles.dropdownOption, region === reg && styles.dropdownOptionActive]}
                        onPress={() => {
                          setRegion(reg);
                          setIsRegionDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            region === reg && styles.dropdownOptionTextActive,
                          ]}
                        >
                          {reg}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.region !== undefined && <Text style={styles.errorText}>{errors.region}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Level <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.level !== undefined && styles.inputError]}
                placeholder="Level"
                placeholderTextColor={COLORS.neutral[400]}
                value={level}
                onChangeText={setLevel}
              />
              {errors.level !== undefined && <Text style={styles.errorText}>{errors.level}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Title <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.title !== undefined && styles.inputError]}
                placeholder="Title"
                placeholderTextColor={COLORS.neutral[400]}
                value={title}
                onChangeText={setTitle}
              />
              {errors.title !== undefined && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Division <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.division !== undefined && styles.inputError]}
                placeholder="Division"
                placeholderTextColor={COLORS.neutral[400]}
                value={division}
                onChangeText={setDivision}
              />
              {errors.division !== undefined && <Text style={styles.errorText}>{errors.division}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Position <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.position !== undefined && styles.inputError]}
                placeholder="Position"
                placeholderTextColor={COLORS.neutral[400]}
                value={position}
                onChangeText={setPosition}
              />
              {errors.position !== undefined && <Text style={styles.errorText}>{errors.position}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                style={styles.input}
                placeholder="Designation"
                placeholderTextColor={COLORS.neutral[400]}
                value={designation}
                onChangeText={setDesignation}
              />
            </View>

            {/* Section 4: Signature Display */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Signature Display</Text>
            </View>

            <View style={styles.signatureRadioGroup}>
              <Pressable
                style={styles.radioRow}
                onPress={() => setSignatureDisplay('beside')}
              >
                <View
                  style={[
                    styles.radioOuterCircle,
                    signatureDisplay === 'beside' && styles.radioOuterCircleActive,
                  ]}
                >
                  {signatureDisplay === 'beside' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={styles.radioText}>SGD beside employee name</Text>
              </Pressable>

              <Pressable
                style={styles.radioRow}
                onPress={() => setSignatureDisplay('above')}
              >
                <View
                  style={[
                    styles.radioOuterCircle,
                    signatureDisplay === 'above' && styles.radioOuterCircleActive,
                  ]}
                >
                  {signatureDisplay === 'above' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={styles.radioText}>Signature above employee name</Text>
              </Pressable>
            </View>

            {/* Upload Signature Button */}
            <View style={styles.uploadContainer}>
              <Pressable style={styles.uploadBtn} onPress={handleSimulateUpload}>
                <Lucide name="upload" size={16} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
                <Text style={styles.uploadBtnText}>Upload Signature</Text>
              </Pressable>

              {signatureFileName !== null && (
                <View style={styles.uploadedBadge}>
                  <Lucide name="file-text" size={14} color={COLORS.semantic.success} style={{ marginRight: 4 }} />
                  <Text style={styles.uploadedBadgeText}>{signatureFileName}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Full-Width Footer Action Button */}
          <View style={styles.modalFooter}>
            <Pressable
              style={[
                styles.submitBtn,
                !isFormValid && styles.submitBtnDisabled,
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.submitBtnText, !isFormValid && styles.submitBtnTextDisabled]}>
                {isEditing ? 'Save Employee' : 'Add Employee'}
              </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    width: '100%',
    maxWidth: 740,
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalCardMobile: {
    maxWidth: '100%',
    maxHeight: '96%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[20],
    paddingBottom: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
  },
  headerTitleGroup: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  scrollBody: {
    maxHeight: 520,
  },
  formContent: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  sectionHeader: {
    marginTop: SPACING[8],
    marginBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingBottom: SPACING[8],
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  inputGroup: {
    position: 'relative',
    gap: 6,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  requiredStar: {
    color: COLORS.semantic.error,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[16],
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    backgroundColor: COLORS.neutral[50],
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  inputError: {
    borderColor: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorBg,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    height: 44,
    paddingHorizontal: SPACING[16],
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
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownOption: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.brand[500],
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  dropdownOptionTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  signatureRadioGroup: {
    gap: SPACING[12],
    marginVertical: SPACING[4],
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterCircleActive: {
    borderColor: COLORS.brand[700],
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand[700],
  },
  radioText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginTop: SPACING[4],
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  uploadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.successBg,
    borderWidth: 1,
    borderColor: COLORS.semantic.successBorder,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.button,
  },
  uploadedBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.success,
  },
  modalFooter: {
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
  },
  submitBtn: {
    width: '100%',
    height: 48,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  submitBtnTextDisabled: {
    color: COLORS.neutral[500],
  },
});
