import React from 'react';
import { View, Text, Pressable, Modal, useWindowDimensions } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide, AlertToast } from '@edge/ui';
import { Employee } from '../data/mockEmployees';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { EmployeeForm } from '../forms/EmployeeForm';
import { SignatureCameraModal } from './SignatureCameraModal';
import { SignatureUploadModal } from './SignatureUploadModal';
import { modalStyles } from '../styles/employeeModalStyles';

interface EmployeeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => Promise<void> | void;
  initialEmployee?: Employee | null;
  tenantId?: string;
}

export function EmployeeFormModal({
  visible,
  onClose,
  onSave,
  initialEmployee = null,
  tenantId,
}: EmployeeFormModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const formState = useEmployeeForm({
    visible,
    initialEmployee,
    onSave,
  });

  const {
    form,
    isCameraActive,
    setIsCameraActive,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    errorMessage,
    setErrorMessage,
    handleNativeFileUpload,
    handleCaptureSignature,
    onSubmit,
  } = formState;

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;
  const isSubmitting = form.formState.isSubmitting;
  const isFormValid = form.formState.isValid;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.modalCard,
            isMobile && modalStyles.modalCardMobile,
            SHADOWS.modal,
          ]}
        >
          {/* Top Decorative Header Accent */}
          <View style={modalStyles.headerGradientAccent} />

          {/* Modal Header */}
          <View style={modalStyles.modalHeader}>
            <View style={modalStyles.headerIconContainer}>
              <Lucide
                name={isEditing ? 'user-check' : 'user-plus'}
                size={20}
                color={COLORS.brand[700]}
              />
            </View>
            <View style={modalStyles.headerTitleGroup}>
              <Text style={modalStyles.modalTitle}>
                {isEditing ? 'Edit Employee Account' : 'Add New Employee'}
              </Text>
              <Text style={modalStyles.modalSubtitle}>
                Create a new employee record and assign system permissions.
              </Text>
            </View>

            <Pressable
              style={modalStyles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close Modal"
            >
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </Pressable>
          </View>

          {/* Form Inline Error Alert */}
          {errorMessage !== null && (
            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <AlertToast
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
                variant="error"
              />
            </View>
          )}

          {/* Form Scrollable Body */}
          <EmployeeForm
            formState={formState}
            isMobile={isMobile}
            tenantId={tenantId}
            isEditing={isEditing}
          />

          {/* Modal Sticky Footer Actions */}
          <View style={modalStyles.modalFooter}>
            <Pressable
              style={modalStyles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                modalStyles.submitBtn,
                isSubmitting && modalStyles.submitBtnDisabled,
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
              <Text style={modalStyles.submitBtnText}>
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Add Employee'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Camera Capture Sub-Modal */}
      <SignatureCameraModal
        visible={isCameraActive}
        onClose={() => setIsCameraActive(false)}
        onCapture={handleCaptureSignature}
      />

      {/* Signature Upload Dialog Sub-Modal */}
      <SignatureUploadModal
        visible={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onFileUpload={handleNativeFileUpload}
        onOpenCamera={() => {
          setIsUploadDialogOpen(false);
          setIsCameraActive(true);
        }}
      />

      {/* Floating Bottom-Right Toast inside Modal */}
      {errorMessage !== null && (
        <View style={modalStyles.modalToastContainer}>
          <Lucide
            name="alert-circle"
            size={18}
            color={COLORS.semantic.error}
            style={{ marginRight: 8 }}
          />
          <Text style={modalStyles.modalToastText}>{errorMessage}</Text>
          <Pressable onPress={() => setErrorMessage(null)} style={{ marginLeft: 12, padding: 4 }}>
            <Lucide name="x" size={14} color={COLORS.neutral[500]} />
          </Pressable>
        </View>
      )}
    </Modal>
  );
}
