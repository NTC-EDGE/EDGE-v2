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
import { Employee, EmployeeRole, EmployeeStatus, DEPARTMENTS, ROLES_LIST } from '../data/mockEmployees';

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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<EmployeeRole>('Evaluator');
  const [department, setDepartment] = useState(DEPARTMENTS[0] || 'Licensing & Registration Division');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [location, setLocation] = useState('Central Office - Quezon City');

  // Form errors
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  useEffect(() => {
    if (initialEmployee !== null && initialEmployee !== undefined) {
      setFirstName(initialEmployee.firstName);
      setLastName(initialEmployee.lastName);
      setEmail(initialEmployee.email);
      setPhone(initialEmployee.phone);
      setRole(initialEmployee.role);
      setDepartment(initialEmployee.department);
      setStatus(initialEmployee.status);
      setLocation(initialEmployee.location);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('Evaluator');
      setDepartment(DEPARTMENTS[0] || 'Licensing & Registration Division');
      setStatus('Active');
      setLocation('Central Office - Quezon City');
    }
    setErrors({});
  }, [initialEmployee, visible]);

  const validate = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string; email?: string } = {};

    if (firstName.trim().length === 0) {
      newErrors.firstName = 'First name is required';
    }
    if (lastName.trim().length === 0) {
      newErrors.lastName = 'Last name is required';
    }
    if (email.trim().length === 0) {
      newErrors.email = 'Email address is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim().length > 0 ? phone.trim() : '+63 900 000 0000',
      role,
      department,
      status,
      location,
    });
  };

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleWrapper}>
              <View style={styles.headerIconContainer}>
                <Lucide
                  name={isEditing ? 'edit' : 'user-plus'}
                  size={18}
                  color={COLORS.brand[700]}
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Employee Account' : 'Add New Employee'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditing
                    ? 'Update staff profile, assignment details, and access control.'
                    : 'Create a new employee record and assign system permissions.'}
                </Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.formContainer}>
            {/* Row: First Name & Last Name */}
            <View style={[styles.formRow, isMobile && styles.formRowColumn]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  First Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.firstName !== undefined && styles.inputError]}
                  placeholder="e.g. John"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={firstName}
                  onChangeText={setFirstName}
                />
                {errors.firstName !== undefined && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.lastName !== undefined && styles.inputError]}
                  placeholder="e.g. Doe"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={lastName}
                  onChangeText={setLastName}
                />
                {errors.lastName !== undefined && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Row: Email & Phone */}
            <View style={[styles.formRow, isMobile && styles.formRowColumn]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.email !== undefined && styles.inputError]}
                  placeholder="e.g. john.doe@example.com"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                {errors.email !== undefined && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. +63 917 123 4567"
                  placeholderTextColor={COLORS.neutral[400]}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Row: Role Selection & Status */}
            <View style={[styles.formRow, isMobile && styles.formRowColumn]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>System Role</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {ROLES_LIST.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[styles.chip, role === r && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{r}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Row: Department */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department / Division</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {DEPARTMENTS.map((dept) => (
                  <Pressable
                    key={dept}
                    onPress={() => setDepartment(dept)}
                    style={[styles.chip, department === dept && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, department === dept && styles.chipTextActive]}>
                      {dept}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Row: Status & Location */}
            <View style={[styles.formRow, isMobile && styles.formRowColumn]}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Status</Text>
                <View style={styles.statusButtonGroup}>
                  {(['Active', 'On Leave', 'Inactive'] as EmployeeStatus[]).map((st) => (
                    <Pressable
                      key={st}
                      onPress={() => setStatus(st)}
                      style={[
                        styles.statusBtn,
                        status === st && styles.statusBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === st && styles.statusBtnTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Station Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Central Office - QC"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Lucide name="check" size={16} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Create Employee'}</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  modalCardMobile: {
    maxWidth: '100%',
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  headerIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[200],
  },
  scrollBody: {
    maxHeight: 520,
  },
  formContainer: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  formRowColumn: {
    flexDirection: 'column',
    gap: SPACING[16],
  },
  inputGroup: {
    flex: 1,
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
    paddingHorizontal: SPACING[12],
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
  inputError: {
    borderColor: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorBg,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  chipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  chipTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statusButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusBtn: {
    flex: 1,
    height: 36,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.brand[600],
  },
  statusBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  statusBtnTextActive: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    gap: SPACING[12],
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[800],
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
