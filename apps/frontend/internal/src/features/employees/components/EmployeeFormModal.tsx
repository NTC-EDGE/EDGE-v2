import React from 'react';
import { View, Text, Pressable, Modal, useWindowDimensions } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { Employee } from '../data/mockEmployees';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { EmployeeForm } from '../forms/EmployeeForm';
import { SignatureCameraModal } from './SignatureCameraModal';
import { SignatureUploadModal } from './SignatureUploadModal';
import { modalStyles } from '../styles/employeeModalStyles';

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
    handleNativeFileUpload,
    handleCaptureSignature,
    onSubmit,
  } = formState;

  if (!visible) {
    return null;
  }

  const isEditing = initialEmployee !== null && initialEmployee !== undefined;
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

          {/* Form Scrollable Body */}
          <EmployeeForm formState={formState} isMobile={isMobile} />

          {/* Modal Sticky Footer Actions */}
          <View style={modalStyles.modalFooter}>
            <Pressable style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                modalStyles.submitBtn,
                !isFormValid && modalStyles.submitBtnDisabled,
              ]}
              onPress={onSubmit}
            >
              <Lucide
                name="check"
                size={16}
                color={COLORS.neutral.white}
                style={{ marginRight: 6 }}
              />
              <Text style={modalStyles.submitBtnText}>
                {isEditing ? 'Save Changes' : 'Add Employee'}
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
    </Modal>
  );
}
