import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, AlertToast } from '@edge/ui';
import { Employee } from '../data/mockEmployees';
import { useChangeEmailForm } from '../hooks/useChangeEmailForm';

interface ChangeEmployeeEmailModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: (updatedEmployee: Employee) => void;
}

export function ChangeEmployeeEmailModal({
  visible,
  employee,
  onClose,
  onSuccess,
}: ChangeEmployeeEmailModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { form, errorMessage, setErrorMessage, onSubmit, isSubmitting } =
    useChangeEmailForm({
      visible,
      employee,
      onSuccess,
      onClose,
    });

  if (!visible || employee === null) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            isMobile && styles.modalCardMobile,
            SHADOWS.modal,
          ]}
        >
          {/* Header Accent */}
          <View style={styles.headerAccent} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIconContainer}>
              <Lucide name="mail" size={20} color={COLORS.brand[700]} />
            </View>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.modalTitle}>Change Login Email</Text>
              <Text style={styles.modalSubtitle}>
                Update primary identity and login credential in Clerk.
              </Text>
            </View>

            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close Modal"
            >
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Inline Error Alert */}
          {errorMessage !== null && (
            <View style={styles.errorContainer}>
              <AlertToast
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
                variant="error"
              />
            </View>
          )}

          {/* Modal Content Body */}
          <View style={styles.modalBody}>
            {/* Target Account Summary Banner */}
            <View style={styles.accountCard}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>
                  {employee.firstName.charAt(0)}
                  {employee.lastName.charAt(0)}
                </Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {employee.firstName} {employee.lastName}
                </Text>
                <Text style={styles.accountCurrentEmail}>
                  Current: <Text style={styles.boldText}>{employee.email}</Text>
                </Text>
              </View>
            </View>

            {/* Security Notice */}
            <View style={styles.warningBox}>
              <Lucide
                name="alert-triangle"
                size={16}
                color={COLORS.semantic.warning}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.warningText}>
                Changing this email will immediately update the staff member&apos;s
                Clerk login username and invalidate login with the previous address.
              </Text>
            </View>

            {/* New Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                New Email Address <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Controller
                control={form.control}
                name="newEmail"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <View style={styles.inputIconWrapper}>
                      <Lucide
                        name="mail"
                        size={15}
                        color={COLORS.neutral[400]}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.inputWithIcon,
                          error !== undefined && styles.inputError,
                        ]}
                        placeholder="new.email@example.com"
                        placeholderTextColor={COLORS.neutral[400]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                    {error !== undefined && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Confirm New Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm New Email Address <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Controller
                control={form.control}
                name="confirmEmail"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <View style={styles.inputIconWrapper}>
                      <Lucide
                        name="check"
                        size={15}
                        color={COLORS.neutral[400]}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.inputWithIcon,
                          error !== undefined && styles.inputError,
                        ]}
                        placeholder="Retype new email address"
                        placeholderTextColor={COLORS.neutral[400]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                    {error !== undefined && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>

          {/* Modal Footer Actions */}
          <View style={styles.modalFooter}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              <Lucide
                name={isSubmitting ? 'loader' : 'check'}
                size={16}
                color={COLORS.neutral.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Updating...' : 'Update Login Email'}
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
    zIndex: 999999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    position: 'relative',
  },
  modalCardMobile: {
    maxWidth: '100%',
  },
  headerAccent: {
    height: 4,
    backgroundColor: COLORS.brand[600],
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingTop: SPACING[16],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.brand[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleGroup: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  errorContainer: {
    paddingHorizontal: SPACING[20],
    paddingTop: SPACING[12],
  },
  modalBody: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    padding: SPACING[12],
    gap: 12,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  accountCurrentEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: RADIUS.input,
    padding: SPACING[12],
  },
  warningText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  requiredStar: {
    color: COLORS.semantic.error,
  },
  inputIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  inputWithIcon: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingLeft: 36,
    paddingRight: 12,
    fontSize: 14,
    color: COLORS.neutral[900],
    backgroundColor: COLORS.neutral.white,
  },
  inputError: {
    borderColor: COLORS.semantic.error,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
