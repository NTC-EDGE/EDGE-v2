import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide, AlertToast } from '@edge/ui';
import { Employee } from '../types/employeeTypes';
import { useChangeEmailForm } from '../hooks/useChangeEmailForm';
import { ChangeEmployeeEmailFormFields } from './ChangeEmployeeEmailFormFields';
import { changeEmailModalStyles as styles } from '../styles/changeEmailModalStyles';

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
          <ChangeEmployeeEmailFormFields
            control={form.control}
            employee={employee}
          />

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
