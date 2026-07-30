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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

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

  const handleNativeFileUpload = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/svg+xml';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setSignatureFileName(file.name);
          setIsUploadDialogOpen(false);
        }
      };
      input.click();
    } else {
      setSignatureFileName('Uploaded_Signature_' + Math.floor(Math.random() * 1000) + '.png');
      setIsUploadDialogOpen(false);
    }
  };

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Top Decorative Header Accent */}
          <View style={styles.headerGradientAccent} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconContainer}>
              <Lucide
                name={isEditing ? 'user-check' : 'user-plus'}
                size={20}
                color={COLORS.brand[700]}
              />
            </View>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Employee Account' : 'Add New Employee'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Create a new employee record and assign system permissions.
              </Text>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close Modal">
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Form Scrollable Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Card: System Access Role */}
            <View style={[styles.cardSection, { zIndex: 60 }]}>
              <View style={styles.sectionHeaderRow}>
                <Lucide name="shield" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                <Text style={styles.cardSectionTitle}>System Role & Access Level</Text>
              </View>

              <View style={[styles.inputGroup, { zIndex: 50 }]}>
                <Text style={styles.label}>
                  Role <Text style={styles.requiredStar}>*</Text>
                </Text>
                <Pressable
                  style={[styles.dropdownTrigger, isRoleDropdownOpen && styles.dropdownTriggerActive]}
                  onPress={() => {
                    setIsRoleDropdownOpen((prev) => !prev);
                    setIsRegionDropdownOpen(false);
                  }}
                >
                  <View style={styles.dropdownValueWrapper}>
                    <View style={styles.roleBadgeIcon}>
                      <Lucide name="user" size={13} color={COLORS.brand[700]} />
                    </View>
                    <Text style={styles.dropdownTriggerText}>{role}</Text>
                  </View>
                  <Lucide
                    name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.neutral[500]}
                  />
                </Pressable>

                {isRoleDropdownOpen && (
                  <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                    <ScrollView style={{ maxHeight: 200 }}>
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
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Section 2: Basic Information */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Lucide name="user" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                <Text style={styles.cardSectionTitle}>Basic Information</Text>
              </View>

              {/* Row 1: Last Name & First Name */}
              <View style={[styles.formGridRow, isMobile && styles.formGridRowMobile]}>
                <View style={styles.inputGroupFlex}>
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
                  {errors.lastName !== undefined && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>

                <View style={styles.inputGroupFlex}>
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
                  {errors.firstName !== undefined && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>
              </View>

              {/* Row 2: Middle Name & Suffix */}
              <View style={[styles.formGridRow, isMobile && styles.formGridRowMobile]}>
                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>Middle Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Middle Name"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={middleName}
                    onChangeText={setMiddleName}
                  />
                </View>

                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>Suffix</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Jr., III"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={suffix}
                    onChangeText={setSuffix}
                  />
                </View>
              </View>

              {/* Row 3: Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputIconWrapper}>
                  <Lucide name="mail" size={15} color={COLORS.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.inputWithIcon,
                      errors.email !== undefined && styles.inputError,
                    ]}
                    placeholder="official.email@example.com"
                    placeholderTextColor={COLORS.neutral[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                {errors.email !== undefined && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
            </View>

            {/* Section 3: Employee Details */}
            <View style={[styles.cardSection, { zIndex: 40 }]}>
              <View style={styles.sectionHeaderRow}>
                <Lucide name="briefcase" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                <Text style={styles.cardSectionTitle}>Employee Assignment & Details</Text>
              </View>

              {/* Row 1: Region & Level */}
              <View style={[styles.formGridRow, isMobile && styles.formGridRowMobile]}>
                <View style={[styles.inputGroupFlex, { zIndex: 45 }]}>
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
                    <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                      {region}
                    </Text>
                    <Lucide
                      name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={COLORS.neutral[500]}
                    />
                  </Pressable>

                  {isRegionDropdownOpen && (
                    <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {REGIONS_LIST.map((reg) => (
                          <Pressable
                            key={reg}
                            style={[
                              styles.dropdownOption,
                              region === reg && styles.dropdownOptionActive,
                            ]}
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

                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>
                    Level <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.level !== undefined && styles.inputError]}
                    placeholder="e.g. Level II"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={level}
                    onChangeText={setLevel}
                  />
                  {errors.level !== undefined && <Text style={styles.errorText}>{errors.level}</Text>}
                </View>
              </View>

              {/* Row 2: Title & Division */}
              <View style={[styles.formGridRow, isMobile && styles.formGridRowMobile]}>
                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>
                    Title <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.title !== undefined && styles.inputError]}
                    placeholder="e.g. Senior Evaluator"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={title}
                    onChangeText={setTitle}
                  />
                  {errors.title !== undefined && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>
                    Division <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.division !== undefined && styles.inputError]}
                    placeholder="e.g. Licensing Division"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={division}
                    onChangeText={setDivision}
                  />
                  {errors.division !== undefined && (
                    <Text style={styles.errorText}>{errors.division}</Text>
                  )}
                </View>
              </View>

              {/* Row 3: Position & Designation */}
              <View style={[styles.formGridRow, isMobile && styles.formGridRowMobile]}>
                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>
                    Position <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.position !== undefined && styles.inputError]}
                    placeholder="e.g. Technical Assessor"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={position}
                    onChangeText={setPosition}
                  />
                  {errors.position !== undefined && (
                    <Text style={styles.errorText}>{errors.position}</Text>
                  )}
                </View>

                <View style={styles.inputGroupFlex}>
                  <Text style={styles.label}>Designation</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Officer-in-Charge"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={designation}
                    onChangeText={setDesignation}
                  />
                </View>
              </View>
            </View>

            {/* Section 4: Signature Display & Upload */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <Lucide name="edit-3" size={16} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                <Text style={styles.cardSectionTitle}>Signature Display & Authentication</Text>
              </View>

              <View style={styles.signatureRadioGrid}>
                <Pressable
                  style={[
                    styles.radioCard,
                    signatureDisplay === 'beside' && styles.radioCardActive,
                  ]}
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
                  <View style={styles.radioTextWrapper}>
                    <Text style={styles.radioTitle}>SGD Beside Name</Text>
                    <Text style={styles.radioSubtitle}>Display SGD tag next to full name</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.radioCard,
                    signatureDisplay === 'above' && styles.radioCardActive,
                  ]}
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
                  <View style={styles.radioTextWrapper}>
                    <Text style={styles.radioTitle}>Signature Above Name</Text>
                    <Text style={styles.radioSubtitle}>Display signature image above name line</Text>
                  </View>
                </Pressable>
              </View>

              {/* Upload Box */}
              {signatureFileName !== null ? (
                <View style={styles.uploadedFileContainer}>
                  <View style={styles.uploadedFileInfo}>
                    <Lucide name="image" size={20} color={COLORS.brand[700]} style={{ marginRight: 10 }} />
                    <View>
                      <Text style={styles.uploadedFileName} numberOfLines={1}>
                        {signatureFileName}
                      </Text>
                      <Text style={styles.uploadedFileSize}>Verified & loaded successfully</Text>
                    </View>
                  </View>

                  <View style={styles.uploadedFileActions}>
                    <Pressable style={styles.replaceBtn} onPress={() => setIsUploadDialogOpen(true)}>
                      <Lucide name="refresh-cw" size={13} color={COLORS.brand[700]} style={{ marginRight: 6 }} />
                      <Text style={styles.replaceBtnText}>Replace</Text>
                    </Pressable>

                    <Pressable style={styles.deleteFileBtn} onPress={() => setSignatureFileName(null)}>
                      <Lucide name="trash-2" size={13} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                      <Text style={styles.deleteFileBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.uploadPlaceholderCard} onPress={() => setIsUploadDialogOpen(true)}>
                  <Lucide name="upload-cloud" size={28} color={COLORS.brand[700]} style={{ marginBottom: 8 }} />
                  <Text style={styles.uploadPlaceholderText}>Upload or Capture Signature</Text>
                  <Text style={styles.uploadPlaceholderSubtext}>Click to add digital signature file</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          {/* Modal Sticky Footer Actions */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
              onPress={handleSave}
            >
              <Lucide name="check" size={16} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>
                {isEditing ? 'Save Changes' : 'Add Employee'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Camera Capture Modal */}
      <Modal
        visible={isCameraActive}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCameraActive(false)}
      >
        <View style={styles.cameraOverlay}>
          <View style={[styles.cameraContainer, SHADOWS.modal]}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Capture Signature</Text>
              <Pressable onPress={() => setIsCameraActive(false)} style={styles.cameraCloseBtn}>
                <Lucide name="x" size={20} color={COLORS.neutral.white} />
              </Pressable>
            </View>

            {/* Simulated Viewfinder */}
            <View style={styles.viewfinder}>
              <View style={styles.viewfinderCornerTL} />
              <View style={styles.viewfinderCornerTR} />
              <View style={styles.viewfinderCornerBL} />
              <View style={styles.viewfinderCornerBR} />

              <Lucide name="edit-3" size={48} color="rgba(255,255,255,0.25)" style={{ marginBottom: 12 }} />
              <Text style={styles.viewfinderText}>
                Position the signature inside the frame
              </Text>
            </View>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <Pressable
                style={styles.cameraCancelBtn}
                onPress={() => setIsCameraActive(false)}
              >
                <Text style={styles.cameraCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.shutterBtn}
                onPress={() => {
                  setSignatureFileName('Captured_Signature_' + Math.floor(Math.random() * 1000) + '.png');
                  setIsCameraActive(false);
                }}
              >
                <View style={styles.shutterBtnInner} />
              </Pressable>

              <View style={{ width: 60 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Signature Upload Dialog Modal */}
      <Modal
        visible={isUploadDialogOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsUploadDialogOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContainer, SHADOWS.modal]}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Add Signature</Text>
              <Pressable onPress={() => setIsUploadDialogOpen(false)} style={styles.dialogCloseBtn}>
                <Lucide name="x" size={18} color={COLORS.neutral[600]} />
              </Pressable>
            </View>

            <View style={styles.dialogBody}>
              {/* Standard Dropzone Upload Area */}
              <Pressable
                style={styles.dropzone}
                onPress={handleNativeFileUpload}
              >
                <Lucide name="upload-cloud" size={36} color={COLORS.brand[700]} style={{ marginBottom: 8 }} />
                <Text style={styles.dropzoneTitle}>Drag and drop signature file here</Text>
                <Text style={styles.dropzoneSubtitle}>or click to browse files from your device</Text>
                <Text style={styles.dropzoneSpecs}>PNG, JPG or SVG formats up to 2MB</Text>
              </Pressable>

              <View style={styles.dialogDividerRow}>
                <View style={styles.dialogDividerLine} />
                <Text style={styles.dialogDividerText}>OR</Text>
                <View style={styles.dialogDividerLine} />
              </View>

              {/* Take Picture Action */}
              <Pressable
                style={styles.dialogCameraBtn}
                onPress={() => {
                  setIsUploadDialogOpen(false);
                  setIsCameraActive(true);
                }}
              >
                <Lucide name="camera" size={16} color={COLORS.neutral.white} style={{ marginRight: 8 }} />
                <Text style={styles.dialogCameraBtnText}>Take Picture with Camera</Text>
              </Pressable>
            </View>

            <View style={styles.dialogFooter}>
              <Pressable style={styles.dialogCancelBtn} onPress={() => setIsUploadDialogOpen(false)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 760,
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  modalCardMobile: {
    maxWidth: '100%',
    maxHeight: '96%',
  },
  headerGradientAccent: {
    height: 4,
    backgroundColor: COLORS.brand[700],
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    gap: SPACING[16],
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: SPACING[20],
  },
  cardSection: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    gap: SPACING[16],
    position: 'relative',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingBottom: 10,
  },
  cardSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGridRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  formGridRowMobile: {
    flexDirection: 'column',
    gap: SPACING[16],
  },
  inputGroup: {
    position: 'relative',
    gap: 6,
  },
  inputGroupFlex: {
    flex: 1,
    position: 'relative',
    gap: 6,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  requiredStar: {
    color: COLORS.semantic.error,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    height: 42,
    paddingHorizontal: SPACING[12],
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    height: '100%',
    padding: 0,
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
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    height: 42,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownTriggerActive: {
    borderColor: COLORS.brand[700],
  },
  dropdownValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTriggerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
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
    zIndex: 9999,
  },
  dropdownOption: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
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
  signatureRadioGrid: {
    flexDirection: 'row',
    gap: SPACING[16],
    flexWrap: 'wrap',
  },
  radioCard: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    padding: 14,
    gap: SPACING[12],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  radioCardActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral[100],
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
  radioTextWrapper: {
    flex: 1,
  },
  radioTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  radioSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
    padding: SPACING[12],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[800],
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
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
  uploadHintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[24],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[800],
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(30, 58, 138, 0.25)',
      },
    }),
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.brand[800],
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cameraBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
    padding: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
  },
  uploadedFileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  uploadedFileSize: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.success,
    marginTop: 2,
  },
  uploadedFileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  replaceBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  deleteFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  deleteFileBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  cameraContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.neutral[900],
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[20],
  },
  cameraTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  cameraCloseBtn: {
    padding: 4,
  },
  viewfinder: {
    height: 240,
    backgroundColor: COLORS.neutral[800],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[700],
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.brand[500],
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.brand[500],
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.brand[500],
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.brand[500],
  },
  viewfinderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    textAlign: 'center',
    paddingHorizontal: SPACING[24],
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[24],
  },
  cameraCancelBtn: {
    padding: 10,
  },
  cameraCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[400],
  },
  shutterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  shutterBtnInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.neutral.white,
  },
  uploadPlaceholderCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    paddingVertical: 24,
    paddingHorizontal: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[50],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  uploadPlaceholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  uploadPlaceholderSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[20],
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: 12,
  },
  dialogTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  dialogCloseBtn: {
    padding: 4,
  },
  dialogBody: {
    gap: SPACING[16],
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.brand[700],
    borderRadius: RADIUS.button,
    paddingVertical: 28,
    paddingHorizontal: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[50],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropzoneTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    textAlign: 'center',
  },
  dropzoneSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
    textAlign: 'center',
  },
  dropzoneSpecs: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 8,
    textAlign: 'center',
  },
  dialogDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dialogDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dialogDividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    marginHorizontal: SPACING[12],
  },
  dialogCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand[800],
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dialogCameraBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  dialogFooter: {
    marginTop: SPACING[20],
    alignItems: 'flex-end',
  },
  dialogCancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dialogCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
});
